package be.bugbounty.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRankDTO {
    private Long userId;
    private String username;
    private int point;
    private int rank;
    private String profilePhoto;
}
