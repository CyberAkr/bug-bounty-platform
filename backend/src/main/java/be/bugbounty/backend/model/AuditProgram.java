package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_program",
        uniqueConstraints = @UniqueConstraint(columnNames = "company_id") // ✅ 1 seul programme par société
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long programId;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private User company;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING, APPROVED
    }
}
