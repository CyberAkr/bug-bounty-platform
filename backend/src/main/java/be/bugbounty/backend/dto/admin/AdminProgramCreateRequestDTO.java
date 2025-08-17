package be.bugbounty.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class AdminProgramCreateRequestDTO {
    @NotBlank private String title;
    @NotBlank private String description;
    @NotNull  private Long companyId;
    private String status; // PENDING/APPROVED/ARCHIVED (optionnel)
}
