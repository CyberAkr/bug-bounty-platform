package be.bugbounty.backend.dto.program;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditProgramRequestDTO {
    private String title;
    private String description;
}