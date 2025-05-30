package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {
    List<AuditProgram> findByCompany(User company);
}