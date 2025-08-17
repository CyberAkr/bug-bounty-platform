package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.admin.AdminProgramCreateRequestDTO;
import be.bugbounty.backend.dto.admin.AdminProgramUpdateRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramRequestDTO;
import be.bugbounty.backend.dto.program.AuditProgramResponseDTO;
import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.AuditProgramRepository;
import be.bugbounty.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditProgramService {

    private final AuditProgramRepository programRepo;
    private final UserRepository userRepo;

    // ========= PUBLIC (déjà utilisés par /api/programs) =========

    public List<AuditProgramResponseDTO> findAll() {
        return programRepo.findAll().stream().map(this::toDto).toList();
    }

    public AuditProgramResponseDTO findById(Long id) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));
        return toDto(p);
    }

    public List<AuditProgramResponseDTO> findByCompany(User company) {
        return programRepo.findByCompany(company).stream().map(this::toDto).toList();
    }

    @Transactional
    public void createProgram(User company, AuditProgramRequestDTO dto) {
        AuditProgram p = new AuditProgram();
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setCompany(company);
        p.setStatus(AuditProgram.Status.PENDING);
        programRepo.save(p);
    }

    // ========= ADMIN (utilisés par /api/admin/programs) =========

    public List<AuditProgramResponseDTO> adminFindAll(String status) {
        List<AuditProgram> list = (status == null || status.isBlank())
                ? programRepo.findAll()
                : programRepo.findByStatus(AuditProgram.Status.valueOf(status.toUpperCase()));
        return list.stream().map(this::toDto).toList();
    }

    @Transactional
    public AuditProgramResponseDTO adminCreate(AdminProgramCreateRequestDTO dto) {
        User company = userRepo.findById(dto.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable: " + dto.getCompanyId()));

        AuditProgram p = new AuditProgram();
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setCompany(company);
        p.setStatus(dto.getStatus() != null
                ? AuditProgram.Status.valueOf(dto.getStatus().toUpperCase())
                : AuditProgram.Status.PENDING);

        return toDto(programRepo.save(p));
    }

    @Transactional
    public AuditProgramResponseDTO adminUpdate(Long id, AdminProgramUpdateRequestDTO dto) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            p.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            p.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            p.setStatus(AuditProgram.Status.valueOf(dto.getStatus().toUpperCase()));
        }

        return toDto(programRepo.save(p));
    }

    @Transactional
    public void adminUpdateStatus(Long id, String status) {
        AuditProgram p = programRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programme introuvable: " + id));
        p.setStatus(AuditProgram.Status.valueOf(status.toUpperCase()));
        programRepo.save(p);
    }

    @Transactional
    public void adminDelete(Long id) {
        if (!programRepo.existsById(id)) return;
        programRepo.deleteById(id);
    }

    // ========= Mapper =========

    private AuditProgramResponseDTO toDto(AuditProgram p) {
        String companyName =
                (p.getCompany() != null && p.getCompany().getUsername() != null)
                        ? p.getCompany().getUsername()
                        : (p.getCompany() != null ? p.getCompany().getEmail() : "—");

        return new AuditProgramResponseDTO(
                p.getProgramId(),            // adapte si l'id a un autre nom
                p.getTitle(),
                p.getDescription(),
                companyName,
                p.getStatus()
        );
    }
}
