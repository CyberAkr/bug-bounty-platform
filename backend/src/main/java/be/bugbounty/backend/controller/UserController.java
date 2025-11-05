package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserPublicDTO;
import be.bugbounty.backend.dto.user.UserResponseDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");

        UserResponseDTO dto = new UserResponseDTO(
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getUsername(),
                user.getBio(),
                user.getPreferredLanguage(),
                user.getProfilePhoto(), // URL publique si déjà uploadée
                user.getCompanyNumber(),
                user.getVerificationStatus() != null ? user.getVerificationStatus().name() : null
        );

        return ResponseEntity.ok(dto);
    }

    // Mise à jour des champs texte (sans fichier)
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
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPreferredLanguage(preferredLanguage);
        user.setBio(bio);

        // On continue d'accepter une URL directe si fournie (optionnel)
        if (profilePhoto != null && !profilePhoto.isBlank()) {
            user.setProfilePhoto(profilePhoto);
        }

        if (verificationDocument != null && !verificationDocument.isEmpty()) {
            user.setVerificationDocument(verificationDocument.getOriginalFilename());
            user.setVerificationStatus(User.VerificationStatus.PENDING);
            // (Stockage réel du document d'entreprise à ajouter si nécessaire)
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "✅ Profil mis à jour"));
    }

    // ✅ Upload photo de profil (fichier)
    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @AuthenticationPrincipal User user,
            @RequestPart("photo") MultipartFile photo
    ) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");

        try {
            String publicUrl = fileStorageService.storeProfilePhoto(photo);
            user.setProfilePhoto(publicUrl);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                    "message", "🖼️ Photo mise à jour",
                    "profilePhoto", publicUrl
            ));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Échec de l’upload"));
        }
    }

    @PostMapping("/verification-document")
    public ResponseEntity<?> uploadVerificationDocument(@AuthenticationPrincipal User user,
                                                        @RequestParam("verificationDocument") MultipartFile file) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");

        user.setVerificationDocument(file.getOriginalFilename());
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        // (Stockage réel à ajouter selon besoin)
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "📄 Document envoyé"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Compte supprimé"));
    }

    // Profil public
    @GetMapping("/{id}/public")
    public ResponseEntity<UserPublicDTO> getPublicProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(new UserPublicDTO(
                        u.getUserId(),
                        u.getUsername(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getPreferredLanguage(),
                        u.getBio(),
                        u.getPoint()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
