package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.Challenge.FlagSubmissionResult;
import be.bugbounty.backend.dto.Challenge.ChallengeCreationRequestDTO;
import be.bugbounty.backend.model.*;
import be.bugbounty.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeSubmissionRepository submissionRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final AuditProgramRepository auditProgramRepository;
    private final BadgeRepository badgeRepository;

    public Challenge getActiveChallenge() {
        LocalDateTime now = LocalDateTime.now();
        List<Challenge> list = challengeRepository.findByStartDateBeforeAndEndDateAfter(now, now);
        return list.isEmpty() ? null : list.get(0); // on prend le 1er actif
    }

    private AuditProgram getGenericChallengeProgram() {
        return (AuditProgram) auditProgramRepository.findByTitle("Défis Hebdo")
                .orElseThrow(() -> new IllegalStateException("Programme 'Défis Hebdo' non trouvé"));
    }

    public Challenge createChallenge(ChallengeCreationRequestDTO dto) {
        AuditProgram program = getGenericChallengeProgram();
        Badge badge = badgeRepository.findById(dto.getBadgeId())
                .orElseThrow(() -> new IllegalArgumentException("Badge non trouvé avec ID : " + dto.getBadgeId()));

        Challenge challenge = new Challenge();
        challenge.setTitle(dto.getTitle());
        challenge.setDescription(dto.getDescription());
        challenge.setExpectedFlag(dto.getExpectedFlag());
        challenge.setStartDate(dto.getStartDate());
        challenge.setEndDate(dto.getEndDate());
        challenge.setBadge(badge);
        challenge.setProgram(program);

        return challengeRepository.save(challenge);
    }

    public FlagSubmissionResult submitFlag(Long challengeId, User researcher, String submittedFlag) {
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
        if (challenge == null) {
            return new FlagSubmissionResult(false, null);
        }

        Optional<ChallengeSubmission> existing = submissionRepository.findByChallengeAndResearcher(challenge, researcher);
        if (existing.isPresent() && existing.get().isValid()) {
            return new FlagSubmissionResult(false, null); // déjà validé
        }

        boolean isValid = challenge.getExpectedFlag().equals(submittedFlag);

        ChallengeSubmission submission = existing.orElseGet(ChallengeSubmission::new);
        submission.setChallenge(challenge);
        submission.setResearcher(researcher);
        submission.setSubmittedFlag(submittedFlag);
        submission.setValid(isValid);
        submission.setSubmittedAt(LocalDateTime.now());
        submissionRepository.save(submission);

        if (isValid) {
            boolean hasBadge = userBadgeRepository.existsByResearcherAndBadge(researcher, challenge.getBadge());
            if (!hasBadge) {
                UserBadge badge = new UserBadge();
                badge.setResearcher(researcher);
                badge.setBadge(challenge.getBadge());
                userBadgeRepository.save(badge);
            }
            return new FlagSubmissionResult(true, challenge.getBadge().getName());
        }

        return new FlagSubmissionResult(false, null);
    }
}
