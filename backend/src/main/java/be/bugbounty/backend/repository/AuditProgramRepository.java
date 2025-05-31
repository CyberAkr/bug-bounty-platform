package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {
    List<AuditProgram> findByCompany(User company);

    Optional<Object> findByTitle(String défisHebdo);
}