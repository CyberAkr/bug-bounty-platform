package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.dto.user.UserResponseDTO;
import be.bugbounty.backend.dto.user.UserUpdateRequestDTO;
import be.bugbounty.backend.dto.user.ChangePasswordRequestDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("admin", "researcher", "company");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =============================
    // === Profil utilisateur ===
    // =============================

    public UserResponseDTO getCurrentUser(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getUsername(),
                user.getBio(),
                user.getPreferredLanguage(),
                user.getProfilePhoto(),
                user.getCompanyNumber(),
                user.getVerificationStatus() != null ? user.getVerificationStatus().name() : null,
                user.getBankAccount()
        );
    }

    @Transactional
    public void updateUser(User user, UserUpdateRequestDTO dto) {
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());
        if (dto.getBio() != null) user.setBio(dto.getBio());
        if (dto.getProfilePhoto() != null) user.setProfilePhoto(dto.getProfilePhoto());
        if (dto.getBankAccount() != null) {
            user.setBankAccount(normalizeIban(dto.getBankAccount()));
        }
        userRepository.save(user);
    }

    /** 🔐 Changement de mot de passe avec vérifications de base */
    @Transactional
    public void changePassword(User user, ChangePasswordRequestDTO dto) {
        if (dto == null || dto.getCurrentPassword() == null || dto.getNewPassword() == null) {
            throw new IllegalArgumentException("Requête invalide");
        }

        // 1) Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }

        // 2) Politique minimale de complexité (ex : 12+, 1 minuscule, 1 majuscule, 1 chiffre)
        String np = dto.getNewPassword();
        if (np.length() < 12
                || !np.matches(".*[a-z].*")
                || !np.matches(".*[A-Z].*")
                || !np.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Le nouveau mot de passe ne respecte pas la politique de sécurité");
        }

        // 3) Encoder et sauver
        user.setPasswordHash(passwordEncoder.encode(np));
        userRepository.save(user);
        // (optionnel) Invalidation de sessions / refresh tokens à gérer si nécessaire
    }

    /**
     * Suppression côté utilisateur :
     * - pas de delete physique pour éviter de casser les FKs (reports, payments, challenges…)
     * - anonymisation RGPD + désactivation du compte.
     */
    @Transactional
    public void deleteUser(User user) {
        anonymizeUserInternal(user);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
    }

    // =============================
    // === Section ADMIN ===
    // =============================

    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional
    public User adminUpdateUser(Long id, AdminUserUpdateRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (dto.getRole() != null) {
            String role = dto.getRole().toLowerCase();
            validateRole(role);
            user.setRole(role);
        }

        if (dto.getBanned() != null) {
            user.setBanned(dto.getBanned());
        }

        if (dto.getVerificationStatus() != null) {
            user.setVerificationStatus(
                    User.VerificationStatus.valueOf(dto.getVerificationStatus().toUpperCase())
            );
        }

        return userRepository.save(user);
    }

    @Transactional
    public User adminCreateUser(AdminUserCreateRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        String role = dto.getRole().toLowerCase();
        validateRole(role);

        if (role.equals("company")) {
            if (dto.getCompanyNumber() == null || dto.getCompanyNumber().isBlank()) {
                throw new IllegalArgumentException("companyNumber requis pour un compte entreprise");
            }
        }

        User u = new User();
        u.setFirstName(dto.getFirstName());
        u.setLastName(dto.getLastName());
        u.setEmail(dto.getEmail());
        u.setUsername(dto.getUsername());
        u.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        u.setRole(role);
        u.setBanned(Boolean.TRUE.equals(dto.getBanned()));
        u.setVerificationStatus(
                dto.getVerificationStatus() != null
                        ? User.VerificationStatus.valueOf(dto.getVerificationStatus().toUpperCase())
                        : User.VerificationStatus.PENDING
        );
        u.setCompanyNumber(role.equals("company") ? dto.getCompanyNumber() : null);
        u.setVerificationDocument(role.equals("company") ? dto.getVerificationDocument() : null);
        u.setPoint(0);

        return userRepository.save(u);
    }

    /**
     * Suppression côté admin :
     * - on tente un delete physique
     * - si la DB refuse (DataIntegrityViolationException => user référencé),
     *   on tombe en mode anonymisation RGPD.
     */
    @Transactional
    public void adminDeleteUser(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return;
        }

        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException e) {
            // L'utilisateur a déjà des rapports / paiements / challenges, etc.
            // => on anonymise pour respecter RGPD + contraintes comptables.
            anonymizeUserInternal(user);
        }
    }

    // =============================
    // === Méthodes utilitaires ===
    // =============================

    private void validateRole(String roleLowercase) {
        if (!ALLOWED_ROLES.contains(roleLowercase)) {
            throw new IllegalArgumentException("Rôle invalide");
        }
    }

    /** Normalise un IBAN : retire les espaces et met en uppercase */
    private String normalizeIban(String raw) {
        if (raw == null) return null;
        return raw.replaceAll("\\s+", "").toUpperCase();
    }

    /**
     * Anonymisation RGPD :
     * - conserve l'ID et les liens pour les rapports / paiements / challenges
     * - efface les données personnelles
     * - désactive le compte.
     */
    @Transactional
    protected void anonymizeUserInternal(User user) {
        String anonSuffix = "deleted_" + user.getUserId();
        String randomPassword = UUID.randomUUID().toString();

        user.setFirstName("Deleted");
        user.setLastName("User");
        user.setEmail(anonSuffix + "@anon.bugbounty.local");
        user.setUsername(anonSuffix);

        user.setBio(null);
        user.setCompanyNumber(null);
        user.setVerificationDocument(null);
        user.setProfilePhoto(null);
        user.setPreferredLanguage(null);
        user.setBankAccount(null);

        user.setPasswordHash(passwordEncoder.encode(randomPassword));
        user.setEmailVerified(false);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpires(null);

        user.setBanned(true);
        // Option : tu peux remettre les points à 0 ou les laisser.
        // user.setPoint(0);

        userRepository.save(user);
    }
}
