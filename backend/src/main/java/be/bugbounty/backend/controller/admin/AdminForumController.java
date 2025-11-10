package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import be.bugbounty.backend.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/forum")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminForumController {

    private final ForumService forumService;

    @GetMapping("/messages")
    public ResponseEntity<Page<ForumMessageViewDTO>> listAll(Pageable pageable) {
        return ResponseEntity.ok(forumService.listAll(pageable));
    }

    @PatchMapping("/messages/{id}/status")
    public ResponseEntity<?> setStatus(@PathVariable Long id, @RequestParam String status) {
        forumService.setStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
