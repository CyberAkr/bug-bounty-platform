package be.bugbounty.backend.dto.user;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String username;
    private String bio;
    private String preferredLanguage;
    private String role;
    private String companyNumber;
}
