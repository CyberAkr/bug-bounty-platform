package be.bugbounty.backend.dto.admin;

import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class AdminProgramUpdateRequestDTO {
    private String title;
    private String description;
    private String status; // PENDING/APPROVED/ARCHIVED
}
