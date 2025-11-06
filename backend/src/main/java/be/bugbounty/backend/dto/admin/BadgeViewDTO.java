package be.bugbounty.backend.dto.admin;

public record BadgeViewDTO(
        Long badgeId,
        String name,
        String description,
        String imagePath
) {}
