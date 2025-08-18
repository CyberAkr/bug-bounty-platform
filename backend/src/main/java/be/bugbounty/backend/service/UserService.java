package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramRequestDTO;
import be.bugbounty.backend.dto.user.UserResponseDTO;
import be.bugbounty.backend.dto.user.UserUpdateRequestDTO;
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

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

    // ======= Public (profil courant) =======

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
                user.getVerificationStatus() != null ? user.getVerificationStatus().name() : null
        );
    }

    @Transactional
    public void updateUser(User user, UserUpdateRequestDTO dto) {
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());
        if (dto.getBio() != null) user.setBio(dto.getBio());
        if (dto.getProfilePhoto() != null) user.setProfilePhoto(dto.getProfilePhoto());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
    }

    // ======= Admin =======

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
        // champs facultatifs laissés à null par défaut (photo, langue, bio)

        return userRepository.save(u);
    }

    @Transactional
    public void adminDeleteUser(Long id) {
        if (!userRepository.existsById(id)) return;
        try {
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            // Si contraintes d'intégrité (FK) empêchent la suppression
            throw new IllegalStateException("Suppression impossible : l'utilisateur est référencé (rapports, challenges, ...).");
        }
    }

    // ======= Helpers =======

    private void validateRole(String roleLowercase) {
        if (!ALLOWED_ROLES.contains(roleLowercase)) {
            throw new IllegalArgumentException("Rôle invalide");
        }
    }


}
