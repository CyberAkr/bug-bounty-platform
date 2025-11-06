package be.bugbounty.backend.dto.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChallengeRequestDTO {
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String theme;          // optionnel
    private String linkToResource; // optionnel

    private Long programId;        // program ciblé
    private Long badgeId;          // optionnel (peut être null)

    // 👇 nouveau : le code gagnant saisi par l’admin (en clair),
    // il sera hashé côté service et JAMAIS renvoyé aux clients
    private String winningCode;
}
