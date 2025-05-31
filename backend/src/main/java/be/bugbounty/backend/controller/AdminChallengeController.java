package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.Challenge.ChallengeCreationRequestDTO;
import be.bugbounty.backend.model.Challenge;
import be.bugbounty.backend.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/challenge")
@RequiredArgsConstructor
public class AdminChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<Challenge> createChallenge(@RequestBody ChallengeCreationRequestDTO dto) {
        Challenge created = challengeService.createChallenge(dto);
        return ResponseEntity.ok(created);
    }

}
