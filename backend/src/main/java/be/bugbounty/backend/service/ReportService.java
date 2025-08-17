package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.report.ReportResponseDTO;
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.model.VulnerabilityType;
import be.bugbounty.backend.repository.AuditProgramRepository;
import be.bugbounty.backend.repository.ReportRepository;
import be.bugbounty.backend.repository.VulnerabilityTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;


    @Autowired
    private VulnerabilityTypeRepository vulnerabilityTypeRepository;

    @Autowired
    private AuditProgramRepository auditProgramRepository;

    private final Path storageDir = Paths.get("uploads/reports");

    public void submitReport(User researcher, Long programId, String title, String severity, MultipartFile file) {
        try {
            // Crée le dossier de stockage s'il n'existe pas
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }

            // Récupère le programme cible
            AuditProgram program = auditProgramRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Programme introuvable."));

            // Vérifie si un rapport existe déjà
            boolean alreadySubmitted = reportRepository.existsByProgramAndResearcher(program, researcher);
            if (alreadySubmitted) {
                throw new IllegalStateException("Vous avez déjà soumis un rapport pour ce programme.");
            }

            // Sauvegarde du fichier PDF
            String fileName = "report-" + UUID.randomUUID() + ".pdf";
            Path filePath = storageDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Création du rapport
            Report report = new Report();
            report.setTitle(title);
            report.setSeverity(Report.Severity.valueOf(severity));
            report.setStatus(Report.Status.PENDING);
            report.setSubmittedAt(LocalDateTime.now());
            report.setResearcher(researcher);
            report.setProgram(program);
            report.setFileUrl("/uploads/reports/" + fileName);

            reportRepository.save(report);

        } catch (IllegalStateException ise) {
            throw ise; // laissé pour traitement spécial (409)
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du traitement du fichier", e);
        }
    }

    public List<ReportResponseDTO> findByResearcher(User researcher) {
        return reportRepository.findByResearcher(researcher).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReportResponseDTO> findByProgram(Long programId) {
        return reportRepository.findByProgram_ProgramId(programId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReportResponseDTO mapToDto(Report report) {
        return new ReportResponseDTO(
                report.getReportId(),
                report.getTitle(),
                report.getSeverity().name(),
                report.getStatus().name(),
                report.getResearcher().getUsername(),
                report.getSubmittedAt(),
                report.getProgram().getTitle()
                // optionnel : report.getFileUrl()
        );
    }

    public boolean hasAlreadySubmitted(Long programId, User user) {
        AuditProgram program = auditProgramRepository.findById(programId)
                .orElseThrow();
        return reportRepository.existsByProgramAndResearcher(program, user);
    }

    public List<Report> getReportsFilteredByStatus(String status) {
        if (status == null) return reportRepository.findAll();
        return reportRepository.findByStatus(Report.Status.valueOf(status.toUpperCase()));
    }


    public Report updateStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));
        report.setStatus(Report.Status.valueOf(status.toUpperCase()));
        return reportRepository.save(report);
    }

    public Report updateVulnerabilityType(Long id, Long vulnerabilityTypeId) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));
        VulnerabilityType type = vulnerabilityTypeRepository.findById(vulnerabilityTypeId)
                .orElseThrow(() -> new RuntimeException("Type de vulnérabilité introuvable"));

        report.setVulnerabilityType(type);
        return reportRepository.save(report);
    }

    public Report updateStatus(Long id, String status, String adminComment) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));

        Report.Status newStatus = Report.Status.valueOf(status.toUpperCase());
        report.setStatus(newStatus);

        if (adminComment != null && !adminComment.isBlank()) {
            report.setAdminComment(adminComment.trim());
        }

        return reportRepository.save(report);
    }




}

