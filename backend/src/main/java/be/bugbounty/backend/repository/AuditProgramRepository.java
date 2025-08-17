package be.bugbounty.backend.repository;// backend/src/main/java/.../repository/AuditProgramRepository.java
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {
    List<AuditProgram> findByStatus(AuditProgram.Status status);
    List<AuditProgram> findByCompany(User company);
    Optional<AuditProgram> findByTitle(String title);

    // ✅ préférer la variante basée sur l'ID
    boolean existsByCompany_UserId(Long userId);
}
