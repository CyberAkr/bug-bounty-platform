package be.bugbounty.backend.dto.user;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String username;
    private String bio;
    private String preferredLanguage;
    private String profilePhoto;
    private String companyNumber;
    private String verificationStatus;
    private String bankAccount;
}
