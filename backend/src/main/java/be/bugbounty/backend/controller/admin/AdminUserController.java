package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.UserService;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.nio.file.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUserUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(userService.adminUpdateUser(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid AdminUserCreateRequestDTO dto) {
        try {
            User created = userService.adminCreateUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            userService.adminDeleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // ====== NOUVEAU : Télécharger/visualiser le PDF de vérification (privé) ======
    @GetMapping("/{id}/verification")
    public ResponseEntity<Resource> downloadVerification(@PathVariable Long id) {
        User company = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User introuvable"));

        String path = company.getVerificationDocument();
        if (path == null || path.isBlank()) return ResponseEntity.notFound().build();

        Path file = Paths.get(path);
        if (!Files.exists(file)) return ResponseEntity.notFound().build();

        try {
            InputStreamResource res = new InputStreamResource(Files.newInputStream(file));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename("verification-" + id + ".pdf").build());
            headers.add("X-Content-Type-Options", "nosniff");
            headers.add("Content-Security-Policy", "default-src 'none'; frame-ancestors 'self';");
            return ResponseEntity.ok().headers(headers).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ====== NOUVEAU : Décision (APPROVED | REJECTED) ======
    public static class VerifyDecision {
        public String status; // "APPROVED" | "REJECTED"
        public String adminComment; // Optionnel : à persister si tu ajoutes un champ dans User
    }

    @PatchMapping("/{id}/verification")
    public ResponseEntity<?> decide(@PathVariable Long id, @RequestBody VerifyDecision body) {
        try {
            User.VerificationStatus st = User.VerificationStatus.valueOf(body.status.toUpperCase());
            AdminUserUpdateRequestDTO dto = new AdminUserUpdateRequestDTO();
            dto.setVerificationStatus(st.name());
            userService.adminUpdateUser(id, dto);
            return ResponseEntity.ok(Map.of("message", "Statut mis à jour : " + st));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide (APPROVED|REJECTED)"));
        } catch (RuntimeException re) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", re.getMessage()));
        }
    }
}
