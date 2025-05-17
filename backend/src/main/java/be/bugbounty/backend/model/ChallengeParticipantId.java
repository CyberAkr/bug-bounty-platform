package be.bugbounty.backend.model;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeParticipantId implements Serializable {
    private Long challenge;
    private Long researcher;
}
