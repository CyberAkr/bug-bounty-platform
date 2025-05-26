package be.bugbounty.backend.dto.program;

import lombok.*;
import be.bugbounty.backend.model.AuditProgram.Status;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditProgramResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private Status status;
}