package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminProgramCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminProgramUpdateRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramResponseDTO;
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.ProgramStatus;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.AuditProgramRepository;
import be.bugbounty.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditProgramService {

    private final AuditProgramRepository programRepo;
    private final UserRepository userRepo;

    // ========= PUBLIC (utilisé par /api/programs) =========

    public List<AuditProgramResponseDTO> findAll() {
        return programRepo.findAllByIsDeletedFalse().stream()
                .map(this::toDto)
                .toList();
    }

    public AuditProgramResponseDTO findById(Long id) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));
        if (p.isDeleted()) {
            throw new EntityNotFoundException("Programme introuvable: " + id);
        }
        return toDto(p);
    }

    public List<AuditProgramResponseDTO> findByCompany(User company) {
        return programRepo.findByCompanyAndIsDeletedFalse(company).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void createProgram(User company, AuditProgramRequestDTO dto) {
        if (programRepo.existsByCompany_UserId(company.getUserId())) {
            throw new IllegalStateException("Vous avez déjà soumis un programme.");
        }
        AuditProgram p = new AuditProgram();
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setCompany(company);
        // statut par défaut côté “soumission” publique
        p.setStatus(ProgramStatus.DRAFT);
        programRepo.save(p);
    }

    // ========= ADMIN (utilisé par /api/admin/programs) =========

    @Transactional
    public AuditProgramResponseDTO adminCreate(AdminProgramCreateRequestDTO dto) {
        if (programRepo.existsByCompany_UserId(dto.getCompanyId())) {
            throw new IllegalStateException("Cette entreprise a déjà un programme.");
        }

        User company = userRepo.findById(dto.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable: " + dto.getCompanyId()));

        AuditProgram p = new AuditProgram();
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setCompany(company);
        p.setStatus(parseStatusOrDefault(dto.getStatus(), ProgramStatus.DRAFT));

        return toDto(programRepo.save(p));
    }

    @Transactional
    public AuditProgramResponseDTO adminUpdate(Long id, AdminProgramUpdateRequestDTO dto) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));

        if (p.isDeleted()) {
            throw new EntityNotFoundException("Programme introuvable: " + id);
        }

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            p.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            p.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            p.setStatus(parseStatusOrDefault(dto.getStatus(), p.getStatus()));
        }

        return toDto(programRepo.save(p));
    }

    @Transactional
    public void adminUpdateStatus(Long id, String status) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));
        if (p.isDeleted()) {
            throw new EntityNotFoundException("Programme introuvable: " + id);
        }
        p.setStatus(parseStatusOrDefault(status, p.getStatus()));
        programRepo.save(p);
    }

    @Transactional
    public void adminDelete(Long id) {
        AuditProgram p = programRepo.findById(id)
                .orElse(null);
        if (p == null || p.isDeleted()) return;

        // ✅ Soft delete côté service
        p.setDeletedAt(LocalDateTime.now());
        p.setDeleted(true);
        programRepo.save(p);
    }

    // ========= Mapper =========

    private AuditProgramResponseDTO toDto(AuditProgram p) {
        String companyName =
                (p.getCompany() != null && p.getCompany().getUsername() != null)
                        ? p.getCompany().getUsername()
                        : (p.getCompany() != null ? p.getCompany().getEmail() : "—");

        return new AuditProgramResponseDTO(
                p.getId(),                  // <-- id correct
                p.getTitle(),
                p.getDescription(),
                companyName,
                p.getStatus()               // ProgramStatus
        );
    }

    @Transactional(readOnly = true)
    public List<AuditProgramResponseDTO> adminFindAll(String status) {
        if (status == null || status.isBlank()) {
            return programRepo.findAllByIsDeletedFalse().stream().map(this::toDto).toList();
        }
        ProgramStatus st = parseStatusOrDefault(status, null);
        if (st == null) {
            return programRepo.findAllByIsDeletedFalse().stream().map(this::toDto).toList();
        }
        return programRepo.findAllByStatusAndIsDeletedFalse(st).stream().map(this::toDto).toList();
    }

    // ========= Helpers =========

    private ProgramStatus parseStatusOrDefault(String raw, ProgramStatus def) {
        if (raw == null || raw.isBlank()) return def;
        try {
            return ProgramStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return def;
        }
    }
}
