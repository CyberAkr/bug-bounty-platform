package be.bugbounty.backend.controller;

import be.bugbounty.backend.model.*;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔥 [login] Reçu : " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ Utilisateur non trouvé");
                    return new RuntimeException("Email introuvable");
                });

        System.out.println("✅ Utilisateur trouvé");

        boolean valid = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        System.out.println("→ Résultat matches() : " + valid);

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);
        System.out.println("✅ Token généré");

        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("researcher");
        user.setBanned(false);
        user.setPoint(0);

        // valeurs par défaut pour les autres champs (évite l'erreur SQL)
        user.setUsername(request.getEmail().split("@")[0]); // ex: "mohamed"
        user.setBio("");
        user.setProfilePhoto(null);
        user.setPreferredLanguage("fr");
        user.setCompanyNumber(null);
        user.setVerificationDocument(null);
        user.setVerificationStatus(User.VerificationStatus.PENDING);

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Utilisateur enregistré"));
    }
}
