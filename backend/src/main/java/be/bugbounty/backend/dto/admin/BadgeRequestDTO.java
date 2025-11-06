package be.bugbounty.backend.dto.admin;

import lombok.Data;

@Data
public class BadgeRequestDTO {
    private String name;
    private String description;
    private String imagePath; // URL renvoyée par l'upload (/files/badges/...)
}
