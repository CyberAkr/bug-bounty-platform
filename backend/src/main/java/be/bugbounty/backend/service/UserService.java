package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.dto.user.*;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
}
