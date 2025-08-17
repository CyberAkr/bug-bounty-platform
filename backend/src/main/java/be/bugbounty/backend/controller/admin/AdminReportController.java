package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.service.ReportService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// DTOs pour les PATCH
record ReportStatusUpdateRequest(
        @NotBlank String status,      // "PENDING" | "APPROVED" | "REJECTED"
        String adminComment           // optionnel
) {}

record ReportVulnerabilityUpdateRequest(
        @NotNull Long vulnerabilityTypeId
) {}

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true") // utile en dev si 4200 → 8080
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // GET /api/admin/reports?status=PENDING
    @GetMapping
    public ResponseEntity<List<Report>> getReports(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(reportService.getReportsFilteredByStatus(status));
    }

    // PATCH /api/admin/reports/{id}/status
    // Body: { "status": "APPROVED", "adminComment": "ok pour paiement" }
    @PatchMapping("/{id}/status")
    public ResponseEntity<Report> updateStatus(@PathVariable Long id,
                                               @Valid @RequestBody ReportStatusUpdateRequest body) {
        Report updated = reportService.updateStatus(id, body.status(), body.adminComment());
        return ResponseEntity.ok(updated);
    }

    // PATCH /api/admin/reports/{id}/vulnerability
    // Body: { "vulnerabilityTypeId": 4 }
    @PatchMapping("/{id}/vulnerability")
    public ResponseEntity<Report> updateVulnerability(@PathVariable Long id,
                                                      @Valid @RequestBody ReportVulnerabilityUpdateRequest body) {
        Report updated = reportService.updateVulnerabilityType(id, body.vulnerabilityTypeId());
        return ResponseEntity.ok(updated);
    }

    // (facultatif) handler simple pour erreurs fonctionnelles
    @ExceptionHandler({ IllegalArgumentException.class, RuntimeException.class })
    public ResponseEntity<String> handleBadRequest(Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
