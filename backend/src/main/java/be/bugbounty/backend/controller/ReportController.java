package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.report.ReportResponseDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService service;

    // Soumission d’un rapport (chercheur)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submit(
            @AuthenticationPrincipal User user,
            @RequestParam("programId") Long programId,
            @RequestParam("title") String title,
            @RequestParam("severity") String severity,
            @RequestParam("file") MultipartFile file
    ) {
        service.submitReport(user, programId, title, severity, file);
        return ResponseEntity.ok(Map.of("message", "Rapport soumis avec succès."));
    }

    // Mes rapports (chercheur)
    @GetMapping("/my")
    public List<ReportResponseDTO> myReports(@AuthenticationPrincipal User user) {
        return service.findByResearcher(user);
    }



    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadForCompany(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) throws IOException {
        Resource res = service.getDownloadableForCompany(user, id);
        String filename = "report-" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(res);
    }
    // Rapports d’un programme (visibilité selon tes règles)
    @GetMapping("/program/{programId}")
    public List<ReportResponseDTO> byProgram(@PathVariable Long programId) {
        return service.findByProgram(programId);
    }
    // Rapports reçus par l'entreprise connectée
    @GetMapping("/received")
    public List<ReportResponseDTO> received(@AuthenticationPrincipal User user) {
        return service.findReceivedByCompany(user);
    }

    // Vérifie si l’utilisateur a déjà soumis un rapport pour ce programme
    @GetMapping("/submitted")
    public ResponseEntity<?> hasSubmitted(
            @AuthenticationPrincipal User user,
            @RequestParam Long programId
    ) {
        boolean submitted = service.hasAlreadySubmitted(programId, user);
        return ResponseEntity.ok(Map.of("submitted", submitted));
    }
}
