package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badge")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // URL publique vers l'image du badge (servie via /files/**)
    @Column(name = "image_path", length = 255)
    private String imagePath; // ex: /files/badges/20251106_...png
}
