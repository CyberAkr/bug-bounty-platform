package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {
    List<AuditProgram> findByStatus(AuditProgram.Status status);
    List<AuditProgram> findByCompany(User company);

    Optional<AuditProgram> findByTitle(String title);
}
