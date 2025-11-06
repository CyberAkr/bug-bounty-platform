package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.BadgeRequestDTO;
import be.bugbounty.backend.dto.admin.BadgeViewDTO;
import be.bugbounty.backend.model.Badge;
import be.bugbounty.backend.repository.BadgeRepository;
import be.bugbounty.backend.service.FileStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/badges")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBadgesController {

    private final BadgeRepository badgeRepository;
    private final FileStorageService fileStorageService;

    // === UPLOAD IMAGE ===
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeBadgeImage(file);
            return ResponseEntity.ok(Map.of("imagePath", url));
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === LIST ===
    @GetMapping
    public ResponseEntity<List<BadgeViewDTO>> list() {
        var list = badgeRepository.findAll().stream()
                .map(this::toView)
                .toList();
        return ResponseEntity.ok(list);
    }

    // === CREATE ===
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody BadgeRequestDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Le nom est requis");
        }
        var badge = new Badge();
        badge.setName(dto.getName().trim());
        badge.setDescription(dto.getDescription());
        badge.setImagePath(dto.getImagePath());
        badgeRepository.save(badge);
        return ResponseEntity.ok(Map.of("id", badge.getBadgeId()));
    }

    // === UPDATE ===
    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody BadgeRequestDTO dto) {
        var badge = badgeRepository.findById(id).orElse(null);
        if (badge == null) {
            return ResponseEntity.badRequest().body("Badge introuvable");
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            badge.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            badge.setDescription(dto.getDescription());
        }
        if (dto.getImagePath() != null && !dto.getImagePath().isBlank()) {
            badge.setImagePath(dto.getImagePath());
        }
        badgeRepository.save(badge);
        return ResponseEntity.ok(Map.of("id", badge.getBadgeId()));
    }

    // === DELETE ===
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!badgeRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Badge introuvable");
        }
        badgeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private BadgeViewDTO toView(Badge b) {
        return new BadgeViewDTO(
                b.getBadgeId(),
                b.getName(),
                b.getDescription(),
                b.getImagePath()
        );
    }
}
