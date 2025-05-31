package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long challengeId;

    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private AuditProgram program;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String theme; // ex : OSINT, Forensic, Web...

    @Column(nullable = false)
    private String linkToResource; // lien vers l’énoncé ou machine à auditer

    @Column(nullable = false)
    private String expectedFlag; // flag à trouver pour valider le défi

}
