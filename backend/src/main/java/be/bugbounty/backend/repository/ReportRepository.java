package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 🔍 Trouver tous les rapports soumis par un chercheur
    List<Report> findByResearcher(User researcher);

    // 🔍 Trouver tous les rapports liés à un programme
    List<Report> findByProgram_Id(Long programId);

    // 🔐 Vérifier si un chercheur a déjà soumis un rapport pour un programme donné
    boolean existsByProgramAndResearcher(AuditProgram program, User researcher);

    @Query("""
  SELECT r
  FROM Report r
  JOIN r.program p
  WHERE p.company = :company
""")
    List<Report> findReceivedByCompany(@Param("company") User company);
    List<Report> findByStatus(Report.Status status);
}
