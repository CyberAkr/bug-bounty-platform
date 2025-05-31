package be.bugbounty.backend.dto.user;
public record UserRankingDTO(
        Long userId,
        String username,
        int point
) {}
