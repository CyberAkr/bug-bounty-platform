package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.report.ReportResponseDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService service;

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

    @GetMapping("/my")
    public List<ReportResponseDTO> myReports(@AuthenticationPrincipal User user) {
        return service.findByResearcher(user);
    }

    @GetMapping("/program/{programId}")
    public List<ReportResponseDTO> byProgram(@PathVariable Long programId) {
        return service.findByProgram(programId);
    }

@GetMapping("/submitted")
public ResponseEntity<?> hasSubmitted(
        @AuthenticationPrincipal User user,
        @RequestParam Long programId
) {    System.out.println("🔍 Authenticated user = " + (user != null ? user.getEmail() : "null"));

    boolean submitted = service.hasAlreadySubmitted(programId, user);
    return ResponseEntity.ok(Map.of("submitted", submitted));
}
}
