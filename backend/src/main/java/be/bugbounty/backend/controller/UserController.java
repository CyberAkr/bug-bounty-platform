package be.bugbounty.backend.controller;

import be.bugbounty.backend.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Non authentifié");
        }

        // retourne uniquement les infos utiles (pas le hash par ex)
        return ResponseEntity.ok(new MeResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        ));
    }

    public record MeResponse(Long id, String email, String firstName, String lastName, String role) {}
}
