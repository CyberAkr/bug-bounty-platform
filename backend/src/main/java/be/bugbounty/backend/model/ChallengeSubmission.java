package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_submission")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne
    @JoinColumn(name = "researcher_id", nullable = false)
    private User researcher;

    @Column(nullable = false)
    private String submittedFlag;

    @Column(nullable = false)
    private boolean valid; // ✅ nom corrigé

    private LocalDateTime submittedAt;
}
