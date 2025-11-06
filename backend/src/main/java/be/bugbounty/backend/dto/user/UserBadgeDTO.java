package be.bugbounty.backend.dto.user;

public record UserBadgeDTO(
        Long id,
        String name,
        String iconUrl
) {}
