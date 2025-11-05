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
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired private ReportRepository reportRepository;
    @Autowired private VulnerabilityTypeRepository vulnerabilityTypeRepository;
    @Autowired private AuditProgramRepository auditProgramRepository;

    private final Path storageDir = Paths.get("uploads/reports");
    private final Path quarantineDir = storageDir.resolve("quarantine");
    private final Path sanitizedDir = storageDir.resolve("sanitized");

    public ReportService() {
        try {
            Files.createDirectories(quarantineDir);
            Files.createDirectories(sanitizedDir);
        } catch (IOException e) {
            System.err.println("⚠️ Impossible de créer les dossiers de stockage : " + e.getMessage());
        }
    }

    // ========================= SUBMIT =========================
    public void submitReport(User researcher, Long programId, String title, String severity, MultipartFile file) {
        try {
            AuditProgram program = auditProgramRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Programme introuvable."));

            if (reportRepository.existsByProgramAndResearcher(program, researcher)) {
                throw new IllegalStateException("Vous avez déjà soumis un rapport pour ce programme.");
            }

            String originalFileName = "report-" + UUID.randomUUID() + ".pdf";
            Path originalPath = quarantineDir.resolve(originalFileName);
            Files.copy(file.getInputStream(), originalPath, StandardCopyOption.REPLACE_EXISTING);

            String sanitizedFileName = "clean-" + UUID.randomUUID() + ".pdf";
            Path sanitizedPath = sanitizedDir.resolve(sanitizedFileName);
            boolean ok = sanitizePdf(originalPath, sanitizedPath);

            Report report = new Report();
            report.setTitle(title);
            report.setSeverity(Report.Severity.valueOf(severity.toUpperCase(Locale.ROOT)));
            report.setStatus(Report.Status.PENDING);
            report.setSubmittedAt(LocalDateTime.now());
            report.setResearcher(researcher);
            report.setProgram(program);
            report.setFileUrl("/uploads/reports/quarantine/" + originalFileName);
            report.setSanitized(ok);
            report.setSanitizedPath(ok ? sanitizedPath.toAbsolutePath().toString() : null);
            reportRepository.save(report);

            System.out.println(" Rapport enregistré: " + title + " (sanitize=" + ok + ")");
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du traitement du rapport : " + e.getMessage(), e);
        }
    }

    // ========================= SANITIZE =========================
    private boolean sanitizePdf(Path input, Path output) {
        // 1) qpdf
        if (runCommandCapture(outOf(List.of(
                List.of("qpdf", "--linearize", input.toString(), output.toString()),
                List.of("qpdf.exe", "--linearize", input.toString(), output.toString()),
                List.of("C:\\Program Files\\QPDF\\bin\\qpdf.exe", "--linearize", input.toString(), output.toString()),
                List.of("C:\\Program Files (x86)\\QPDF\\bin\\qpdf.exe", "--linearize", input.toString(), output.toString())
        )))) {
            return fileLooksOk(output);
        }

        // 2) Ghostscript (Windows: gswin64c.exe)
        if (runCommandCapture(outOf(List.of(
                List.of("gswin64c", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
                        "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sOutputFile=" + output, input.toString()),
                List.of("gswin64c.exe", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
                        "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sOutputFile=" + output, input.toString()),
                List.of("C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
                        "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sOutputFile=" + output, input.toString())
        )))) {
            return fileLooksOk(output);
        }

        System.err.println("⚠️ Aucune méthode de sanitisation n'a réussi (qpdf/gs introuvables ?)");
        return false;
    }

    private boolean fileLooksOk(Path file) {
        try {
            return Files.exists(file) && Files.size(file) > 0;
        } catch (IOException e) {
            return false;
        }
    }

    // Lance une liste de commandes candidates (dans l'ordre) et s'arrête au 1er succès (exitCode == 0).
    private boolean runCommandCapture(List<List<String>> candidates) {
        for (List<String> cmd : candidates) {
            try {
                if (!Files.exists(Paths.get(cmd.get(0))) && !isOnPath(cmd.get(0))) {
                    continue; // binaire inexistant ET pas sur le PATH -> on essaie la suivante
                }
                System.out.println("→ Exec: " + String.join(" ", cmd));
                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.redirectErrorStream(true);
                Process p = pb.start();

                String output = readAll(p.getInputStream());
                int rc = p.waitFor();

                if (rc == 0) {
                    System.out.println("✔ OK (" + cmd.get(0) + ")\n" + output);
                    return true;
                } else {
                    System.err.println("✖ ECHEC (" + cmd.get(0) + ") code=" + rc + "\n" + output);
                }
            } catch (Exception e) {
                System.err.println("✖ Exception (" + String.join(" ", cmd) + "): " + e.getMessage());
            }
        }
        return false;
    }

    private boolean isOnPath(String exe) {
        try {
            Process p = new ProcessBuilder(isWindows() ? "where" : "which", exe).start();
            int rc = p.waitFor();
            return rc == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isWindows() {
        String os = System.getProperty("os.name","").toLowerCase(Locale.ROOT);
        return os.contains("win");
    }

    private static String readAll(InputStream in) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            for (String line; (line = br.readLine()) != null; ) {
                sb.append(line).append(System.lineSeparator());
            }
            return sb.toString();
        }
    }

    private static List<List<String>> outOf(List<List<String>> cmds) {
        return cmds;
    }

    // ========================= DTOs/Méthodes existantes =========================
    public List<ReportResponseDTO> findByResearcher(User researcher) {
        return reportRepository.findByResearcher(researcher)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ReportResponseDTO> findByProgram(Long programId) {
        return reportRepository.findByProgram_Id(programId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private ReportResponseDTO mapToDto(Report r) {
        return new ReportResponseDTO(
                r.getReportId(),
                r.getTitle(),
                r.getSeverity().name(),
                r.getStatus().name(),
                r.getResearcher().getUsername(),
                r.getSubmittedAt(),
                r.getProgram().getTitle()
        );
    }

    public boolean hasAlreadySubmitted(Long programId, User user) {
        AuditProgram program = auditProgramRepository.findById(programId).orElseThrow();
        return reportRepository.existsByProgramAndResearcher(program, user);
    }

    public List<Report> getReportsFilteredByStatus(String status) {
        if (status == null) return reportRepository.findAll();
        return reportRepository.findByStatus(Report.Status.valueOf(status.toUpperCase(Locale.ROOT)));
        // (si besoin: .findByStatusAndProgram_IsDeletedFalse(...))
    }

    public Report updateStatus(Long id, String status, String adminComment) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));
        report.setStatus(Report.Status.valueOf(status.toUpperCase(Locale.ROOT)));
        if (adminComment != null && !adminComment.isBlank()) {
            report.setAdminComment(adminComment.trim());
        }
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

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }

    public Resource getSanitizedResource(Long id) throws IOException {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));
        if (!report.isSanitized() || report.getSanitizedPath() == null) {
            throw new RuntimeException("Aperçu non disponible (non sanitizé)");
        }
        Path file = Paths.get(report.getSanitizedPath());
        if (!Files.exists(file)) {
            throw new RuntimeException("Fichier sanitized introuvable");
        }
        return new InputStreamResource(Files.newInputStream(file));
    }
}
