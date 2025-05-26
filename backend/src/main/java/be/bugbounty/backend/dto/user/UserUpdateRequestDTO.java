package be.bugbounty.backend.dto.user;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDTO {
    private String firstName;
    private String lastName;
    private String preferredLanguage;
    private String bio;
    private String profilePhoto;
}
