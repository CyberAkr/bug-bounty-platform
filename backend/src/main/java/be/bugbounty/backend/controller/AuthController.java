package be.bugbounty.backend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.MethodArgumentNotValidException;
import be.bugbounty.backend.dto.user.RegisterRequest;
import be.bugbounty.backend.model.LoginRequest;
import be.bugbounty.backend.model.LoginResponse;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.JwtService;
import be.bugbounty.backend.web.auth.ResendCodeRequest;
import be.bugbounty.backend.web.auth.VerifyEmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender; // peut être null en dev

    @Value("${mail.from:Bug Bounty <no-reply@bugbounty.local>}")
    private String defaultFrom;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    private static final int CODE_TTL_MINUTES = 15;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            @Nullable JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    // ========= SIGN IN =========
    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔥 [login] Reçu : " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email introuvable"));

        // 1) banni ?
        if (user.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Compte banni");
        }

        // 2) email non vérifié ?  ⟵ AVANT le check password
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            // soit message texte (front détecte par regex)
            // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Email non vérifié");

            // soit (recommandé) un JSON "propre"
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "unverified", "email", user.getEmail()));
        }

        // 3) mot de passe
        boolean valid = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    // ========= REGISTER =========
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "auth.register.emailInUse"));
        }

        // rôle company => companyNumber requis
        if ("company".equalsIgnoreCase(request.getRole())
                && (request.getCompanyNumber() == null || request.getCompanyNumber().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("message", "auth.register.errors.companyNumber"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setBio(request.getBio());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setRole(request.getRole());
        user.setCompanyNumber(request.getCompanyNumber());
        user.setBanned(false);
        user.setPoint(0);
        user.setVerificationDocument(null);
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        user.setProfilePhoto(null);

        String code = generateCode6();
        user.setEmailVerified(false);
        user.setEmailVerificationCode(code);
        user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES));

        userRepository.save(user);

        boolean emailSent = sendVerificationEmail(user.getEmail(), code);

        return ResponseEntity.accepted().body(Map.of(
                "message", "auth.register.success",
                "email", user.getEmail(),
                "expiresAt", user.getEmailVerificationExpires().toString(),
                "emailSent", emailSent
        ));
    }

    // Centralise les erreurs de Bean Validation -> 400 { errors: [ {field, message} ] }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of(
                        "field", fe.getField(),
                        "message", fe.getDefaultMessage() // ex: "auth.register.errors.password.rules"
                ))
                .toList();
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }


    // ========= VERIFY EMAIL =========
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (Boolean.TRUE.equals(u.getEmailVerified())) {
            return ResponseEntity.ok(Map.of("status", "already_verified"));
        }

        if (u.getEmailVerificationCode() == null ||
                u.getEmailVerificationExpires() == null ||
                LocalDateTime.now().isAfter(u.getEmailVerificationExpires()) ||
                !u.getEmailVerificationCode().equals(req.code())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "invalid_or_expired"));
        }

        u.setEmailVerified(true);
        u.setEmailVerificationCode(null);
        u.setEmailVerificationExpires(null);
        userRepository.save(u);

        String token = jwtService.generateToken(u);
        return ResponseEntity.ok(Map.of("status", "verified", "token", token));
    }

    // ========= RESEND CODE =========
    @PostMapping("/resend-code")
    public ResponseEntity<?> resend(@RequestBody ResendCodeRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (Boolean.TRUE.equals(u.getEmailVerified())) {
            return ResponseEntity.ok(Map.of("status", "already_verified"));
        }

        String code = u.getEmailVerificationCode();
        if (code == null || u.getEmailVerificationExpires() == null ||
                LocalDateTime.now().isAfter(u.getEmailVerificationExpires())) {
            code = generateCode6();
            u.setEmailVerificationCode(code);
        }
        u.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES));
        userRepository.save(u);

        boolean emailSent = sendVerificationEmail(u.getEmail(), code);
        return ResponseEntity.ok(Map.of("status", "resent", "emailSent", emailSent));
    }

    // ======= helpers =======
    private String generateCode6() {
        int n = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", n);
    }

    private String resolveFromAddress() {
        if (defaultFrom != null && !defaultFrom.isBlank()) return defaultFrom;
        if (smtpUsername != null && !smtpUsername.isBlank()) return smtpUsername;
        return "no-reply@bugbounty.local";
    }

    private boolean sendVerificationEmail(String to, String code) {
        if (mailSender == null) return false;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(resolveFromAddress());
            msg.setTo(to);
            msg.setSubject("Votre code de vérification");
            msg.setText("Voici votre code: " + code + " (valide " + CODE_TTL_MINUTES + " minutes).");
            mailSender.send(msg);
            return true;
        } catch (Exception ex) {
            System.out.println("[WARN] Envoi email échoué: " + ex.getMessage());
            return false;
        }
    }
}
