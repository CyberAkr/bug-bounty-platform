package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "challenge_participant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ChallengeParticipantId.class)
public class ChallengeParticipant {

    @Id
    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Id
    @ManyToOne
    @JoinColumn(name = "researcher_id", nullable = false)
    private User researcher;
}
