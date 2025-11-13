package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserPublicDTO;
import be.bugbounty.backend.dto.user.UserResponseDTO;
import be.bugbounty.backend.dto.user.ChangePasswordRequestDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.FileStorageService;
import be.bugbounty.backend.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final UserService userService;

    public UserController(UserRepository userRepository,
                          FileStorageService fileStorageService,
                          UserService userService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
    }

    // -------------------------
    // Section: utilisateur courant (/me)
    // -------------------------

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
                user.getProfilePhoto(),
                user.getCompanyNumber(),
                user.getVerificationStatus() != null ? user.getVerificationStatus().name() : null,
                user.getBankAccount()
        );
        return ResponseEntity.ok(dto);
    }

    // Mise à jour des champs texte (et document éventuel)
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCurrentUser(
            @AuthenticationPrincipal User user,
            @RequestPart("firstName") String firstName,
            @RequestPart("lastName") String lastName,
            @RequestPart("preferredLanguage") String preferredLanguage,
            @RequestPart("bio") String bio,
            @RequestPart(value = "bankAccount", required = false) String bankAccount,
            @RequestPart(value = "profilePhoto", required = false) String profilePhoto,
            @RequestPart(value = "verificationDocument", required = false) MultipartFile verificationDocument
    ) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPreferredLanguage(preferredLanguage);
        user.setBio(bio);

        if (bankAccount != null) {
            user.setBankAccount(bankAccount.replaceAll("\\s+", "").toUpperCase());
        }

        if (profilePhoto != null && !profilePhoto.isBlank()) {
            user.setProfilePhoto(profilePhoto);
        }

        if ("company".equalsIgnoreCase(user.getRole()) && verificationDocument != null && !verificationDocument.isEmpty()) {
            try {
                long maxPdfBytes = 20L * 1024 * 1024; // 20MB
                String privatePath = fileStorageService.storeVerificationPdf(user.getUserId(), verificationDocument, maxPdfBytes);
                user.setVerificationDocument(privatePath);
                user.setVerificationStatus(User.VerificationStatus.PENDING);
            } catch (IllegalArgumentException iae) {
                return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
            } catch (IOException ioe) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Stockage du document impossible"));
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "✅ Profil mis à jour"));
    }

    // 🔐 Changement de mot de passe
    @PostMapping(value = "/me/password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User user,
                                            @RequestBody ChangePasswordRequestDTO dto) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");
        try {
            userService.changePassword(user, dto);
            return ResponseEntity.ok(Map.of("message", "🔒 Mot de passe mis à jour"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Échec du changement de mot de passe"));
        }
    }

    // Upload fichier photo de profil
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

    // Endpoint dédié (optionnel) si tu utilises un flux séparé depuis le formulaire
    @PostMapping(value = "/verification-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadVerificationDocument(@AuthenticationPrincipal User user,
                                                        @RequestPart("verificationDocument") MultipartFile file) {
        if (user == null) return ResponseEntity.status(401).body("Non authentifié");
        if (!"company".equalsIgnoreCase(user.getRole()))
            return ResponseEntity.status(403).body(Map.of("error","Réservé aux comptes entreprise"));

        try {
            long maxPdfBytes = 20L * 1024 * 1024;
            String privatePath = fileStorageService.storeVerificationPdf(user.getUserId(), file, maxPdfBytes);
            user.setVerificationDocument(privatePath);
            user.setVerificationStatus(User.VerificationStatus.PENDING);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "📄 Document envoyé"));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (IOException ioe) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Stockage du document impossible"));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal User currentUser) {
        userService.deleteUser(currentUser);  // ✅ soft anonymize, pas de delete physique
        return ResponseEntity.ok(Map.of(
                "message", "user.deleted"
        ));
    }
    // -------------------------
    // Section: profil public (lecture)
    // -------------------------

    @GetMapping("/{id}/public")
    public ResponseEntity<UserPublicDTO> getPublic(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> new UserPublicDTO(
                        u.getUserId(),
                        u.getUsername(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getPreferredLanguage(),
                        u.getBio(),
                        u.getPoint(),
                        u.getProfilePhoto()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/badges")
    public ResponseEntity<List<?>> getBadges(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(List.of());
    }
}
