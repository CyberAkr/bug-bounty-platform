package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.service.AuditProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/programs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgramController {

    @Autowired
    private AuditProgramService auditProgramService;

    @GetMapping
    public ResponseEntity<List<AuditProgram>> getPrograms(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(auditProgramService.getProgramsFilteredByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(auditProgramService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
