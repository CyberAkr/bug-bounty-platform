package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.Challenge;
import be.bugbounty.backend.model.ChallengeSubmission;
import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {
    // Empêche un chercheur de soumettre plusieurs fois
    boolean existsByChallengeAndResearcher(Challenge challenge, User researcher);

    Optional<ChallengeSubmission> findByChallengeAndResearcher(Challenge challenge, User researcher);
}
