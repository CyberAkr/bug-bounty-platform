package be.bugbounty.backend.repository;
import java.util.Optional;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    // Trouver le défi actif (maintenant)
    Optional<AuditProgram> findByTitle(String title);

    List<Challenge> findByStartDateBeforeAndEndDateAfter(LocalDateTime now1, LocalDateTime now2);
}
