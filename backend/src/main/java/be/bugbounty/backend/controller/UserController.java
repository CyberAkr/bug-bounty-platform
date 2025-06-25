package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserPublicDTO;
import be.bugbounty.backend.dto.user.UserResponseDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ CORRIGÉ : ne dépend plus de @AuthenticationPrincipal
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        User user = (User) auth.getPrincipal();

        UserResponseDTO dto = new UserResponseDTO(
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

        return ResponseEntity.ok(dto);
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCurrentUser(
            @AuthenticationPrincipal User user,
            @RequestPart("firstName") String firstName,
            @RequestPart("lastName") String lastName,
            @RequestPart("preferredLanguage") String preferredLanguage,
            @RequestPart("bio") String bio,
            @RequestPart(value = "profilePhoto", required = false) String profilePhoto,
            @RequestPart(value = "verificationDocument", required = false) MultipartFile verificationDocument
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPreferredLanguage(preferredLanguage);
        user.setBio(bio);

        if (profilePhoto != null && !profilePhoto.isBlank()) {
            user.setProfilePhoto(profilePhoto);
        }

        if (verificationDocument != null && !verificationDocument.isEmpty()) {
            user.setVerificationDocument(verificationDocument.getOriginalFilename());
            user.setVerificationStatus(User.VerificationStatus.PENDING);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "✅ Profil mis à jour"));
    }

    @PostMapping("/verification-document")
    public ResponseEntity<?> uploadVerificationDocument(
            @AuthenticationPrincipal User user,
            @RequestParam("verificationDocument") MultipartFile file) {
        if (user == null) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        user.setVerificationDocument(file.getOriginalFilename());
        user.setVerificationStatus(User.VerificationStatus.PENDING);

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "📄 Document envoyé"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Compte supprimé"));
    }

    // profil public
    @GetMapping("/{id}/public")
    public ResponseEntity<UserPublicDTO> getPublicProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(new UserPublicDTO(
                        user.getUserId(),
                        user.getUsername(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getPreferredLanguage(),
                        user.getBio(),
                        user.getPoint()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
