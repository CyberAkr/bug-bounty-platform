package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.report.*;
import be.bugbounty.backend.model.*;
import be.bugbounty.backend.repository.ReportRepository;
import be.bugbounty.backend.repository.AuditProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private AuditProgramRepository auditProgramRepository;

    public void submitReport(User researcher, ReportRequestDTO dto) {
        Report report = new Report();
        report.setTitle(dto.getTitle());
        report.setSeverity(Report.Severity.valueOf(dto.getSeverity()));
        report.setStatus(Report.Status.PENDING);
        report.setSubmittedAt(LocalDateTime.now());
        report.setResearcher(researcher);
        report.setProgram(auditProgramRepository.findById(dto.getProgramId()).orElseThrow());
        reportRepository.save(report);
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
                report.getProgram().getTitle() // ✅ Ajout ici
        );
    }

}