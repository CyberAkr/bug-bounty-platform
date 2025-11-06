package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.Challenge.FlagSubmissionResult;
import be.bugbounty.backend.model.Challenge;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    /**
     * Récupère le challenge actif – accessible uniquement aux chercheurs connectés
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('RESEARCHER')")
    public ResponseEntity<Challenge> getCurrentChallenge() {
        Challenge challenge = challengeService.getActiveChallenge();
        return challenge != null
                ? ResponseEntity.ok(challenge)
                : ResponseEntity.noContent().build();
    }
    @GetMapping("/active")
    @PreAuthorize("hasRole('RESEARCHER')")
    public ResponseEntity<List<Challenge>> getActiveChallenges() {
        var list = challengeService.findActive();
        return list.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(list);
    }


    /**
     * Soumet un flag pour un challenge – réservé aux chercheurs
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('RESEARCHER')")
    public ResponseEntity<String> submitFlag(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        Long challengeId = Long.parseLong(body.get("challengeId"));
        String submittedFlag = body.get("flag");

        FlagSubmissionResult result = challengeService.submitFlag(challengeId, user, submittedFlag);

        if (result.isSuccess()) {
            return ResponseEntity.ok("🎉 Flag correct ! Tu gagnes le badge : " + result.getBadgeName());
        } else {
            return ResponseEntity.badRequest().body("❌ Flag incorrect ou déjà validé.");
        }
    }
}
