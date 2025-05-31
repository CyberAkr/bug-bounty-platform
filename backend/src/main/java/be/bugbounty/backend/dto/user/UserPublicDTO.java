package be.bugbounty.backend.dto.user;

public record UserPublicDTO(
        Long userId,
        String username,
        String firstName,
        String lastName,
        String preferredLanguage,
        String bio,
        int point
) {}
