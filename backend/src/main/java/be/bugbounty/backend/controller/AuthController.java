package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.RegisterRequest;
import be.bugbounty.backend.model.LoginRequest;
import be.bugbounty.backend.model.LoginResponse;
import be.bugbounty.backend.model.User;
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
                .orElseThrow(() -> new RuntimeException("Email introuvable"));

        boolean valid = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);
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
        user.setUsername(request.getUsername());
        user.setBio(request.getBio());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setRole(request.getRole()); // dynamic: "company" or "researcher"
        user.setCompanyNumber(request.getCompanyNumber());

        // champs par défaut
        user.setBanned(false);
        user.setPoint(0);
        user.setVerificationDocument(null);
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        user.setProfilePhoto(null);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Utilisateur enregistré"));
    }
}
