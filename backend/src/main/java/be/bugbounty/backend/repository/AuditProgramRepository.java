package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.ProgramStatus;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuditProgramRepository extends JpaRepository<AuditProgram, Long> {

    // Programmes d’une entreprise (non supprimés)
    List<AuditProgram> findByCompanyAndIsDeletedFalse(User company);

    // Vérifie si une entreprise (userId) a déjà un programme
    boolean existsByCompany_UserId(Long userId);

    // Liste par statut (non supprimés)
    List<AuditProgram> findAllByStatusAndIsDeletedFalse(ProgramStatus status);

    // Liste “actives” (non supprimées)
    List<AuditProgram> findAllByIsDeletedFalse();

    // Recherche par titre
    Optional<AuditProgram> findByTitle(String title);
    // Optional<AuditProgram> findByTitleIgnoreCase(String title);
}
