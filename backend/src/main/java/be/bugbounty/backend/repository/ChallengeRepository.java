package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    // retourne le challenge actif (si plusieurs, on prend le plus récent)
    Optional<Challenge> findFirstByStartDateBeforeAndEndDateAfterOrderByStartDateDesc(
            LocalDateTime now1, LocalDateTime now2
    );

    List<Challenge> findByStartDateBeforeAndEndDateAfter(LocalDateTime now1, LocalDateTime now2);
}
