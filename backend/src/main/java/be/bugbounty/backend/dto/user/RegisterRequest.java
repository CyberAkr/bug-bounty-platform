package be.bugbounty.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
            message = "auth.register.errors.password.rules"
    )
    private String password;

    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String username;

    private String bio;

    @NotBlank
    private String preferredLanguage; // "fr" | "en"

    @NotBlank
    private String role; // "researcher" | "company" | "admin"

    private String companyNumber; // requis si role=company
}
