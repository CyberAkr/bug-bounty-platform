package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.Challenge.FlagSubmissionResult;
import be.bugbounty.backend.dto.admin.ChallengeRequestDTO;
import be.bugbounty.backend.dto.admin.ChallengeViewDTO;
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.Badge;
import be.bugbounty.backend.model.Challenge;
import be.bugbounty.backend.model.ChallengeSubmission;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.AuditProgramRepository;
import be.bugbounty.backend.repository.BadgeRepository;
import be.bugbounty.backend.repository.ChallengeRepository;
import be.bugbounty.backend.repository.ChallengeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeSubmissionRepository submissionRepository;
    private final AuditProgramRepository auditProgramRepository;
    private final BadgeRepository badgeRepository;

    // BCrypt pour hasher / vérifier le code gagnant
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** Retourne le "meilleur" défi actif (le plus récent par startDate) */
    public Challenge getActiveChallenge() {
        LocalDateTime now = LocalDateTime.now();
        return challengeRepository
                .findFirstByStartDateBeforeAndEndDateAfterOrderByStartDateDesc(now, now)
                .orElse(null);
    }

    /** Liste de tous les défis actifs à l’instant T */
    public List<Challenge> findActive() {
        LocalDateTime now = LocalDateTime.now();
        return challengeRepository.findByStartDateBeforeAndEndDateAfter(now, now);
    }

    /** Soumission du code gagnant par un chercheur */
    public FlagSubmissionResult submitFlag(Long challengeId, User researcher, String submittedFlag) {
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
        if (challenge == null) return new FlagSubmissionResult(false, null);

        LocalDateTime now = LocalDateTime.now();
        if (!challenge.isActiveAt(now)) {
            return new FlagSubmissionResult(false, null);
        }

        // Un seul gagnant : si déjà attribué, on arrête
        if (challenge.getWinner() != null) {
            return new FlagSubmissionResult(false, null);
        }

        Optional<ChallengeSubmission> existing = submissionRepository.findByChallengeAndResearcher(challenge, researcher);

        boolean isValid = encoder.matches(
                submittedFlag == null ? "" : submittedFlag,
                challenge.getWinningCodeHash()
        );

        ChallengeSubmission submission = existing.orElseGet(ChallengeSubmission::new);
        submission.setChallenge(challenge);
        submission.setResearcher(researcher);
        submission.setSubmittedFlag(submittedFlag);
        submission.setValid(isValid);
        submission.setSubmittedAt(now);
        submissionRepository.save(submission);

        if (isValid) {
            // Premier gagnant : on fige
            challenge.setWinner(researcher);
            challengeRepository.save(challenge);
            // Attribution de badge volontairement désactivée (fonctionnalité pas prête)
            return new FlagSubmissionResult(true, null);
        }

        return new FlagSubmissionResult(false, null);
    }

    // =======================
    // ====   ADMIN API   ====
    // =======================

    public List<Challenge> findAll() {
        return challengeRepository.findAll();
    }

    /** Vue légère (DTO) pour éviter les proxys Hibernate */
    @Transactional(readOnly = true)
    public List<ChallengeViewDTO> findAllViews() {
        var list = challengeRepository.findAll();
        return list.stream().map(this::toView).toList();
    }

    private ChallengeViewDTO toView(Challenge c) {
        var p = c.getProgram() == null ? null
                : new ChallengeViewDTO.SimpleProgramDTO(
                c.getProgram().getProgramId(),
                c.getProgram().getTitle()
        );
        var w = c.getWinner() == null ? null
                : new ChallengeViewDTO.SimpleUserDTO(
                c.getWinner().getUserId(),
                c.getWinner().getEmail()
        );
        return new ChallengeViewDTO(
                c.getChallengeId(),
                c.getTitle(),
                c.getDescription(),
                c.getStartDate(),
                c.getEndDate(),
                c.getTheme(),
                c.getLinkToResource(),
                p,
                w
        );
    }

    public Challenge create(ChallengeRequestDTO dto) {
        if (dto.getWinningCode() == null || dto.getWinningCode().isBlank()) {
            throw new IllegalArgumentException("Le code gagnant est requis.");
        }

        AuditProgram program = auditProgramRepository.findById(dto.getProgramId())
                .orElseThrow(() -> new RuntimeException("Programme introuvable"));

        Badge badge = null;
        if (dto.getBadgeId() != null) {
            badge = badgeRepository.findById(dto.getBadgeId())
                    .orElseThrow(() -> new RuntimeException("Badge introuvable"));
        }

        Challenge c = new Challenge();
        c.setTitle(dto.getTitle());
        c.setDescription(dto.getDescription());
        c.setStartDate(dto.getStartDate());
        c.setEndDate(dto.getEndDate());
        c.setTheme(dto.getTheme());
        c.setLinkToResource(dto.getLinkToResource());
        c.setProgram(program);
        c.setBadge(badge);
        c.setWinningCodeHash(encoder.encode(dto.getWinningCode()));
        // winner = null par défaut

        return challengeRepository.save(c);
    }

    public Challenge update(Long id, ChallengeRequestDTO dto) {
        Challenge c = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge introuvable"));

        AuditProgram program = auditProgramRepository.findById(dto.getProgramId())
                .orElseThrow(() -> new RuntimeException("Programme introuvable"));

        Badge badge = null;
        if (dto.getBadgeId() != null) {
            badge = badgeRepository.findById(dto.getBadgeId())
                    .orElseThrow(() -> new RuntimeException("Badge introuvable"));
        }

        c.setTitle(dto.getTitle());
        c.setDescription(dto.getDescription());
        c.setStartDate(dto.getStartDate());
        c.setEndDate(dto.getEndDate());
        c.setTheme(dto.getTheme());
        c.setLinkToResource(dto.getLinkToResource());
        c.setProgram(program);
        c.setBadge(badge);

        // Si un nouveau code gagnant est fourni, on remplace le hash
        if (dto.getWinningCode() != null && !dto.getWinningCode().isBlank()) {
            c.setWinningCodeHash(encoder.encode(dto.getWinningCode()));
        }

        return challengeRepository.save(c);
    }

    public void delete(Long id) {
        challengeRepository.deleteById(id);
    }
}
