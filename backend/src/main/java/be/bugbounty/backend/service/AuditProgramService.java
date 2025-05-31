
package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.program.*;
import be.bugbounty.backend.model.*;
import be.bugbounty.backend.repository.AuditProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditProgramService {

    @Autowired
    private AuditProgramRepository auditProgramRepository;

    public List<AuditProgramResponseDTO> findAll() {
        return auditProgramRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AuditProgramResponseDTO> findByCompany(User company) {
        return auditProgramRepository.findByCompany(company).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AuditProgramResponseDTO findById(Long id) {
        AuditProgram program = auditProgramRepository.findById(id).orElseThrow();
        return mapToDto(program);
    }

    public void createProgram(User company, AuditProgramRequestDTO dto) {
        AuditProgram program = new AuditProgram();
        program.setTitle(dto.getTitle());
        program.setDescription(dto.getDescription());
        program.setStatus(AuditProgram.Status.PENDING);
        program.setCompany(company);
        auditProgramRepository.save(program);
    }

    private AuditProgramResponseDTO mapToDto(AuditProgram program) {
        return new AuditProgramResponseDTO(
                program.getProgramId(), program.getTitle(), program.getDescription(),
                program.getCompany().getFirstName() + " " + program.getCompany().getLastName(),
                program.getStatus()
        );
    }

    // 🔐 ADMIN: Liste filtrée par statut (PENDING, APPROVED, REJECTED)
    public List<AuditProgram> getProgramsFilteredByStatus(String status) {
        if (status == null) return auditProgramRepository.findAll();
        return auditProgramRepository.findByStatus(AuditProgram.Status.valueOf(status.toUpperCase()));
    }


    // 🔐 ADMIN: Valider ou refuser un programme
    public AuditProgram updateStatus(Long id, String status) {
        AuditProgram program = auditProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programme introuvable"));
        program.setStatus(AuditProgram.Status.valueOf(status.toUpperCase()));
        return auditProgramRepository.save(program);
    }
}