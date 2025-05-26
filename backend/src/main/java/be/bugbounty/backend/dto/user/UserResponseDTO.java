package be.bugbounty.backend.dto.user;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String username;
    private String bio;
    private String preferredLanguage;
    private String profilePhoto;
}

