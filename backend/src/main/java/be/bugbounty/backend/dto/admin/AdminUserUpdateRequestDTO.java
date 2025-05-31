
package be.bugbounty.backend.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserUpdateRequestDTO {
    private String role; // researcher, company, admin
    private Boolean banned;
    private String verificationStatus; // PENDING, APPROVED, REJECTED
}
