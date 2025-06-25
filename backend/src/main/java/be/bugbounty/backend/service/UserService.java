package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.dto.user.*;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

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
                user.getVerificationStatus().name()
        );
    }

    public void updateUser(User user, UserUpdateRequestDTO dto) {
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPreferredLanguage(dto.getPreferredLanguage());
        user.setBio(dto.getBio());
        user.setProfilePhoto(dto.getProfilePhoto());
        userRepository.save(user);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
    }

    // ✅ pour admin : liste tous les utilisateurs
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // ✅ pour admin : modifier rôle, ban, vérif
    public User adminUpdateUser(Long id, AdminUserUpdateRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }

        if (dto.getBanned() != null) {
            user.setBanned(dto.getBanned());
        }

        if (dto.getVerificationStatus() != null) {
            user.setVerificationStatus(User.VerificationStatus.valueOf(dto.getVerificationStatus().toUpperCase()));
        }

        return userRepository.save(user);
    }

    // ✅ pour admin : création d'un utilisateur
    public User adminCreateUser(AdminUserCreateRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setUsername(dto.getUsername());
        user.setBio(dto.getBio());
        user.setPreferredLanguage(dto.getPreferredLanguage());
        user.setRole(dto.getRole());
        user.setCompanyNumber(dto.getCompanyNumber());

        // valeurs par défaut
        user.setBanned(false);
        user.setPoint(0);
        user.setVerificationDocument(null);
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        user.setProfilePhoto(null);

        return userRepository.save(user);
    }

    // ✅ pour admin : suppression par id
    public void adminDeleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
