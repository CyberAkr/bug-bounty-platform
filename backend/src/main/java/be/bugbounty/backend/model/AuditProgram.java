package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

// backend/src/main/java/be/bugbounty/backend/model/AuditProgram.java
@Entity
@Table(
        name = "audit_program",
        uniqueConstraints = @UniqueConstraint(columnNames = "company_id") // ✅ 1 seul programme par société
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditProgram {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long programId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private User company;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status { PENDING, APPROVED }
}
