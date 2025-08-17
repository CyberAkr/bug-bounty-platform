package be.bugbounty.backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class AdminUserCreateRequestDTO {
    @NotBlank @Size(max=100) private String firstName;
    @NotBlank @Size(max=100) private String lastName;
    @Email @NotBlank @Size(max=150) private String email;
    @NotBlank @Size(min=3, max=50) private String username;
    @NotBlank @Size(min=6, max=100) private String password;
    @NotBlank private String role; // "admin" | "researcher" | "company"

    // Optionnels par défaut (exigés seulement si role=company)
    private String companyNumber;
    private String verificationDocument;

    // Flags/admin
    private String verificationStatus; // PENDING/APPROVED/REJECTED (default PENDING)
    private Boolean banned;            // default false
}
