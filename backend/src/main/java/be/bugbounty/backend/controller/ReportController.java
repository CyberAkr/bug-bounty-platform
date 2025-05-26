package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.report.*;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService service;

    @PostMapping
    public ResponseEntity<?> submit(@AuthenticationPrincipal User user, @RequestBody ReportRequestDTO dto) {
        service.submitReport(user, dto);
        return ResponseEntity.ok("Rapport soumis.");
    }

    @GetMapping("/my")
    public List<ReportResponseDTO> myReports(@AuthenticationPrincipal User user) {
        return service.findByResearcher(user);
    }

    @GetMapping("/program/{programId}")
    public List<ReportResponseDTO> byProgram(@PathVariable Long programId) {
        return service.findByProgram(programId);
    }
}
