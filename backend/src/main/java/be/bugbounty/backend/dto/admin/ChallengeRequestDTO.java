package be.bugbounty.backend.dto.admin;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChallengeRequestDTO {
    private String title;
    private String description;
    private Long badgeId;
    private Long programId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String theme;
    private String linkToResource;
    private String expectedFlag;
}
