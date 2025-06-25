package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.VulnerabilityUpdateDTO;
import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public ResponseEntity<List<Report>> getReports(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(reportService.getReportsFilteredByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(reportService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/vulnerability")
    public ResponseEntity<?> updateVulnerability(@PathVariable Long id, @RequestBody VulnerabilityUpdateDTO dto) {
        try {
            return ResponseEntity.ok(reportService.updateVulnerabilityType(id, dto.vulnerability_type_id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
