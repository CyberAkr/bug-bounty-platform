package be.bugbounty.backend.dto.report;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDTO {
    private Long programId;
    private String title;
    private String severity;
}