package be.bugbounty.backend.dto.user;
public record UserRankingDTO(
        Long userId,
        String username,
        Integer point,
        String profilePhoto // nullable
) {}
