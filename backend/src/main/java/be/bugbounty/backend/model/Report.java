package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "report")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne
    @JoinColumn(name = "researcher_id", nullable = false)
    private User researcher;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private AuditProgram program;

    @Column(columnDefinition = "LONGTEXT")
    private String title;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String adminComment;

    @Column(nullable = false)
    private String fileUrl;

    @ManyToOne
    @JoinColumn(name = "vulnerability_type_id")
    private VulnerabilityType vulnerabilityType;

    public enum Severity {
        LOW, MEDIUM, HIGH
    }

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
