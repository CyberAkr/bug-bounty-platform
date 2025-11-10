package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role; // researcher, company, admin

    private String profilePhoto;
    private String preferredLanguage;
    private String username;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String companyNumber;
    private String verificationDocument;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    // IMPORTANT : champ renommé en "banned" mais colonne conservée "is_banned"
    @Column(name = "is_banned")
    private boolean banned;

    private int point;

    // ======== Email verification ========
    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(length = 10)
    private String emailVerificationCode;

    private LocalDateTime emailVerificationExpires;

    public enum VerificationStatus {
        PENDING, APPROVED, REJECTED
    }
}
