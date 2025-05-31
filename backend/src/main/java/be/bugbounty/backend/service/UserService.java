package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.user.*;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                user.getCompanyNumber(), // ✅ 10e
                user.getVerificationStatus().name() // ✅ 11e
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
        Optional<User> optionalUser = userRepository.findByEmail(email);
        return optionalUser.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
    }
}