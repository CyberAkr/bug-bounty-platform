package be.bugbounty.backend.dto.Challenge;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChallengeCreationRequestDTO {
    private String title;
    private String description;
    private String expectedFlag;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long badgeId;
}
