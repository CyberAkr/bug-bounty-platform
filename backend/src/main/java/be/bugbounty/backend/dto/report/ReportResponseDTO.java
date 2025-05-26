package be.bugbounty.backend.dto.report;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {
    private Long id;
    private String title;
    private String severity;
    private String status;
    private String researcher;
    private LocalDateTime submittedAt;
}