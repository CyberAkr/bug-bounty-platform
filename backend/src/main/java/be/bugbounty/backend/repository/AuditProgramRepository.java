package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.ProgramStatus;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {

    // Programmes de l'entreprise (non supprimés)
    List<AuditProgram> findByCompanyAndIsDeletedFalse(User company);

    // Vérification "1 programme ouvert max" (non supprimé + status dans la liste)
    boolean existsByCompany_UserIdAndIsDeletedFalseAndStatusIn(
            Long userId, Collection<ProgramStatus> statuses
    );

    // Listes filtrées
    List<AuditProgram> findAllByIsDeletedFalse();
    List<AuditProgram> findAllByStatusAndIsDeletedFalse(ProgramStatus status);

    Optional<Object> findByTitle(String défisHebdo);
}
