package be.bugbounty.backend.dto.admin;

import java.time.LocalDateTime;

public record ChallengeViewDTO(
        Long challengeId,
        String title,
        String description,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String theme,
        String linkToResource,
        SimpleProgramDTO program,
        SimpleUserDTO winner
) {
    public record SimpleProgramDTO(Long programId, String title) {}
    public record SimpleUserDTO(Long userId, String email) {}
}
