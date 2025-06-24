package be.bugbounty.backend.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserCreateRequestDTO {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String username;
    private String bio;
    private String preferredLanguage;
    private String role; // admin, researcher, company
    private String companyNumber;
}