package be.bugbounty.backend.dto.admin;

import be.bugbounty.backend.model.User;

public class AdminUserResponseDTO {
    public Long user_id;
    public String username;
    public String email;
    public String role;
    public boolean is_banned;
    public String verification_status;

    public AdminUserResponseDTO(User user) {
        this.user_id = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.is_banned = user.isBanned();
        this.verification_status = user.getVerificationStatus().name();
    }
}
