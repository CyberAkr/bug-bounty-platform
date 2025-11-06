package be.bugbounty.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long challengeId;

    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = true)
    private Badge badge;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({
            "company", "reports", "subscribers",
            "hibernateLazyInitializer","handler"
    })
    private AuditProgram program;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column
    private String theme;

    @Column
    private String linkToResource;

    @JsonIgnore
    @Column(name = "winning_code_hash", nullable = false)
    private String winningCodeHash;

    @ManyToOne
    @JoinColumn(name = "winner_user_id")
    @JsonIgnoreProperties({
            "passwordHash","verificationDocument",
            "emailVerificationCode","emailVerificationExpires",
            "hibernateLazyInitializer","handler"
    })
    private User winner;

    @JsonIgnore
    public boolean isActiveAt(LocalDateTime t) {
        return (t.isAfter(startDate) || t.isEqual(startDate)) && t.isBefore(endDate);
    }
}
