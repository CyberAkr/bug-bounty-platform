// src/main/java/be/bugbounty/backend/controller/ForumController.java
package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.forum.ForumMessageCreateRequest;
import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import be.bugbounty.backend.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/messages")
    public ResponseEntity<Page<ForumMessageViewDTO>> list(Pageable pageable) {
        return ResponseEntity.ok(forumService.listPublic(pageable));
    }

    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(Authentication auth, @Valid @RequestBody ForumMessageCreateRequest req) {
        try {
            String email = auth.getName(); // ton JwtAuthenticationFilter met l'email en principal
            return ResponseEntity.ok(forumService.createMessage(email, req));
        } catch (SecurityException se) {
            return ResponseEntity.status(403).body("User banned");
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        }
    }
}
