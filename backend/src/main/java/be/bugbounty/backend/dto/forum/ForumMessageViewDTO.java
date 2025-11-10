package be.bugbounty.backend.dto.forum;

public record ForumMessageViewDTO(
        Long id,
        String content,
        String postedAt,      // ISO string
        String status,        // ACTIVE | DELETED
        AuthorDTO author
) {
    public record AuthorDTO(Long id, String username, String role, boolean banned, String profilePhoto) {}
}
