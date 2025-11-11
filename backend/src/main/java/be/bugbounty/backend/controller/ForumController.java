// src/main/java/be/bugbounty/backend/controller/ForumController.java
package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.forum.ForumMessageCreateRequest;
import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ForumEventsService;
import be.bugbounty.backend.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private final ForumEventsService events;

    @GetMapping("/messages")
    public ResponseEntity<Page<ForumMessageViewDTO>> list(Pageable pageable) {
        return ResponseEntity.ok(forumService.listPublic(pageable));
    }

    // 🔔 stream temps réel
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return events.register();
    }

    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(Authentication auth,
                                    @Valid @RequestBody ForumMessageCreateRequest req) {
        try {
            String key;
            Object principal = auth.getPrincipal();
            if (principal instanceof User u) {
                key = u.getEmail();
            } else {
                key = auth.getName();
            }
            return ResponseEntity.ok(forumService.createMessage(key, req));
        } catch (SecurityException se) {
            return ResponseEntity.status(403).body("User banned");
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}
