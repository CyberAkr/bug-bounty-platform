package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.AdminProgramCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminProgramUpdateRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramResponseDTO;
import be.bugbounty.backend.service.AuditProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/programs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProgramController {

    private final AuditProgramService service;

    @GetMapping
    public ResponseEntity<List<AuditProgramResponseDTO>> getAll(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.adminFindAll(status));
    }

    @PostMapping
    public ResponseEntity<AuditProgramResponseDTO> create(@Valid @RequestBody AdminProgramCreateRequestDTO dto) {
        try {
            var created = service.adminCreate(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException ex) {
            // 409 si un programme "ouvert" existe déjà
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage(), ex);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AuditProgramResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody AdminProgramUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.adminUpdate(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id,
                                             @RequestBody AdminProgramUpdateRequestDTO dto) {
        service.adminUpdateStatus(id, dto.getStatus());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.adminDelete(id); // soft delete
        return ResponseEntity.noContent().build();
    }
}
