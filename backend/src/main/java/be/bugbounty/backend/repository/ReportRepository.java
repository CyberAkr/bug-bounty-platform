package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByResearcher(User user);
    List<Report> findByProgram_ProgramId(Long id);
}
