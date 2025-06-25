package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 🔍 Trouver tous les rapports soumis par un chercheur
    List<Report> findByResearcher(User researcher);

    // 🔍 Trouver tous les rapports liés à un programme
    List<Report> findByProgram_ProgramId(Long programId);

    // 🔐 Vérifier si un chercheur a déjà soumis un rapport pour un programme donné
    boolean existsByProgramAndResearcher(AuditProgram program, User researcher);

    List<Report> findByStatus(Report.Status status);
}
