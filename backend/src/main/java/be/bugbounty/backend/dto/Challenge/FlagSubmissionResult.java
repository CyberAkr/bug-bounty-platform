package be.bugbounty.backend.dto.Challenge;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FlagSubmissionResult {
    private boolean success;
    private String badgeName; // null si pas gagné
}
