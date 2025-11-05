package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.RegisterRequest;
import be.bugbounty.backend.model.LoginRequest;
import be.bugbounty.backend.model.LoginResponse;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.JwtService;
import be.bugbounty.backend.web.auth.ResendCodeRequest;
import be.bugbounty.backend.web.auth.VerifyEmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender; // auto-config (spring-boot-starter-mail)

    private static final int CODE_TTL_MINUTES = 15;

    // ========= SIGN IN =========
    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔥 [login] Reçu : " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email introuvable"));

        boolean valid = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Email non vérifié");
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    // ========= REGISTER =========
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","Cet email est déjà utilisé"));
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

        // vérif email
        String code = String.format("%06d", new java.util.Random().nextInt(1_000_000));
        user.setEmailVerified(false);
        user.setEmailVerificationCode(code);
        user.setEmailVerificationExpires(java.time.LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES));

        userRepository.save(user);

        boolean emailSent = true;
        try {
            sendVerificationEmail(user.getEmail(), code);
        } catch (Exception ex) {
            // ne pas échouer l’inscription si le mail plante
            emailSent = false;
            System.out.println("[WARN] Envoi email échoué: " + ex.getMessage());
        }

        return ResponseEntity.accepted().body(Map.of(
                "message", "Utilisateur enregistré. Vérifiez votre e-mail.",
                "email", user.getEmail(),
                "expiresAt", user.getEmailVerificationExpires().toString(),
                "emailSent", emailSent
        ));
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

        // Option: générer un JWT après vérif
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

        // anti-spam simple: si l'ancien code est encore valide > renvoyer le même,
        // sinon régénérer un nouveau
        String code = u.getEmailVerificationCode();
        if (code == null || u.getEmailVerificationExpires() == null ||
                LocalDateTime.now().isAfter(u.getEmailVerificationExpires())) {
            code = generateCode6();
            u.setEmailVerificationCode(code);
        }
        u.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES));
        userRepository.save(u);

        sendVerificationEmail(u.getEmail(), code);
        return ResponseEntity.ok(Map.of("status", "resent"));
    }

    // ========= helpers =========
    private String generateCode6() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    private void sendVerificationEmail(String to, String code) {
        if (mailSender == null) {
            System.out.println("[WARN] MailSender absent — code pour " + to + " = " + code);
            return;
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Votre code de vérification");
        msg.setText("Voici votre code: " + code + " (valide " + CODE_TTL_MINUTES + " minutes).");
        mailSender.send(msg);
    }
}
