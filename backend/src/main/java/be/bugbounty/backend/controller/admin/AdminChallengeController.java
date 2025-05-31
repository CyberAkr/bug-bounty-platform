
package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.Challenge;
import be.bugbounty.backend.service.ChallengeService;
import be.bugbounty.backend.dto.admin.ChallengeRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/challenges")
@PreAuthorize("hasRole('ADMIN')")
public class AdminChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<Challenge>> getAll() {
        return ResponseEntity.ok(challengeService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ChallengeRequestDTO dto) {
        try {
            return ResponseEntity.ok(challengeService.create(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ChallengeRequestDTO dto) {
        try {
            return ResponseEntity.ok(challengeService.update(id, dto));
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
