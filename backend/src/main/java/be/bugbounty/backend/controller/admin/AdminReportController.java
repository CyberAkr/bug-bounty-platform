package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.ReportRepository;
import be.bugbounty.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    // Liste des rapports (optionnel: filtrer par status)
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(value = "status", required = false) String status,
                                  @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Report> list = (status == null)
                ? reportRepository.findAll()
                : reportRepository.findByStatus(Report.Status.valueOf(status.toUpperCase()));

        var dto = list.stream().map(r -> new Object() {
            public final Long report_id = r.getReportId();
            public final String title = r.getTitle();
            public final String severity = r.getSeverity().name();
            public final String status = r.getStatus().name();
            public final Object researcher = r.getResearcher() == null ? null
                    : new Object() {
                public final Long id = r.getResearcher().getUserId();
                public final String username = r.getResearcher().getUsername();
            };
            public final String submitted_at = r.getSubmittedAt().toString();
            public final String admin_comment = r.getAdminComment();
            public final Long vulnerability_type_id = r.getVulnerabilityType() == null ? null : r.getVulnerabilityType().getTypeId();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    // Aperçu (prévisualisation) du PDF sanitizé
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        try {
            Resource res = reportService.getSanitizedResource(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename("report-" + id + ".pdf").build());
            headers.add("X-Content-Type-Options","nosniff");
            headers.add("Content-Security-Policy","default-src 'none'; frame-ancestors 'self';");
            return ResponseEntity.ok().headers(headers).body(res);
        } catch (RuntimeException | IOException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Mise à jour du statut
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody StatusUpdate body,
                                          @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            reportService.updateStatus(id, body.getStatus(), body.getAdminComment());
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        }
    }

    // Mise à jour du type de vulnérabilité
    @PatchMapping("/{id}/vulnerability")
    public ResponseEntity<?> updateVuln(@PathVariable Long id,
                                        @RequestBody VulnUpdate body,
                                        @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            reportService.updateVulnerabilityType(id, body.getVulnerabilityTypeId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        }
    }

    // Suppression d’un rapport
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            reportService.deleteReport(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        }
    }

    // DTOs des PATCH
    public static class StatusUpdate {
        private String status;
        private String adminComment;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAdminComment() { return adminComment; }
        public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
    }

    public static class VulnUpdate {
        private Long vulnerabilityTypeId;
        public Long getVulnerabilityTypeId() { return vulnerabilityTypeId; }
        public void setVulnerabilityTypeId(Long vulnerabilityTypeId) { this.vulnerabilityTypeId = vulnerabilityTypeId; }
    }

    private boolean isAdmin(User user) {
        if (user == null) return false;
        String role = user.getRole(); // adapte selon ton modèle User
        return role != null && (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("ROLE_ADMIN"));
    }
}
