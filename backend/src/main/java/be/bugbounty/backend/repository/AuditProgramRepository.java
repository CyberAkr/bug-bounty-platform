// backend/src/main/java/be/bugbounty/backend/repository/AuditProgramRepository.java
package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {
    List<AuditProgram> findByCompany(User company);

    boolean existsByCompany_UserId(Long userId);

    List<AuditProgram> findAllByStatus(AuditProgram.Status status);

    // 👇 AJOUTE CECI
    Optional<AuditProgram> findByTitle(String title);
    // (si tu préfères ignorer la casse)
    // Optional<AuditProgram> findByTitleIgnoreCase(String title);
}
