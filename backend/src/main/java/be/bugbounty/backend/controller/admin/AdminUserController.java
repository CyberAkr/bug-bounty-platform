package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;

    // === Liste brute (inchangée) ===
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    // === Liste "résumée" AVEC hasVerificationDocument ===
    @GetMapping("/summary")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersSummary() {
        List<User> users = userService.findAll();

        List<Map<String, Object>> dto = users.stream().map(u -> {
            boolean hasDoc = false;
            String p = u.getVerificationDocument();
            if (p != null && !p.isBlank()) {
                try { hasDoc = Files.exists(Paths.get(p)); } catch (Exception ignored) {}
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", u.getUserId());
            row.put("username", u.getUsername());
            row.put("email", u.getEmail());
            row.put("role", u.getRole());
            row.put("verificationStatus",
                    u.getVerificationStatus() == null ? null : u.getVerificationStatus().name());
            row.put("hasVerificationDocument", hasDoc);
            return row;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }


    // === PATCH user (inchangé) ===
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUserUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(userService.adminUpdateUser(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === CREATE (inchangé) ===
    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid AdminUserCreateRequestDTO dto) {
        try {
            User created = userService.adminCreateUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === DELETE (inchangé) ===
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            userService.adminDeleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // ====== Télécharger/visualiser le PDF de vérification (privé) ======
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

    // ====== Décision (APPROVED | REJECTED) ======
    public static class VerifyDecision {
        public String status;          // "APPROVED" | "REJECTED"
        public String adminComment;    // Optionnel : à persister si tu ajoutes un champ dans User
    }

    @PatchMapping("/{id}/verification")
    public ResponseEntity<?> decide(@PathVariable Long id, @RequestBody VerifyDecision body) {
        try {
            User.VerificationStatus st = User.VerificationStatus.valueOf(body.status.toUpperCase(Locale.ROOT));
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

    // ====== (Optionnel) endpoint booléen simple : existe ? ======
    @GetMapping("/{id}/verification/exists")
    public ResponseEntity<Map<String,Boolean>> verificationExists(@PathVariable Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User introuvable"));
        boolean exists = false;
        String p = u.getVerificationDocument();
        if (p != null && !p.isBlank()) {
            try { exists = Files.exists(Paths.get(p)); } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
