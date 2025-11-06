package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.ChallengeRequestDTO;
import be.bugbounty.backend.dto.admin.ChallengeViewDTO;
import be.bugbounty.backend.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/challenges")
@PreAuthorize("hasRole('ADMIN')")
public class AdminChallengeController {

    private final ChallengeService challengeService;

    public AdminChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeViewDTO>> getAll() {
        return ResponseEntity.ok(challengeService.findAllViews());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ChallengeRequestDTO dto) {
        try {
            var c = challengeService.create(dto);
            return ResponseEntity.ok(Map.of("id", c.getChallengeId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ChallengeRequestDTO dto) {
        try {
            var c = challengeService.update(id, dto);
            return ResponseEntity.ok(Map.of("id", c.getChallengeId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            challengeService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
