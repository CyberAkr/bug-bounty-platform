package be.bugbounty.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_program")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AuditProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id") // ✅ un seul mapping pour la PK
    private Long programId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({
            "passwordHash","verificationDocument","emailVerificationCode","emailVerificationExpires",
            "hibernateLazyInitializer","handler"
    })
    private User company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramStatus status;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ====== ✅ Alias legacy pour compatibilité du code existant ======
    /** @deprecated Utiliser getProgramId() */
    @Deprecated
    public Long getId() { return programId; }

    /** @deprecated Utiliser setProgramId(Long) */
    @Deprecated
    public void setId(Long id) { this.programId = id; }
}
