
package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.program.*;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.AuditProgramService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/programs")
public class AuditProgramController {

    @Autowired
    private AuditProgramService service;

    @GetMapping
    public List<AuditProgramResponseDTO> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AuditProgramResponseDTO getOne(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/my")
    public List<AuditProgramResponseDTO> getMine(@AuthenticationPrincipal User user) {
        return service.findByCompany(user);
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User user,
                                    @RequestBody @Valid AuditProgramRequestDTO dto) {
        if (!"company".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body("Seules les entreprises peuvent créer un programme.");
        }
        try {
            service.createProgram(user, dto);
            return ResponseEntity.ok("Programme soumis avec succès.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage()); // ✅ déjà un programme
        }
    } }

