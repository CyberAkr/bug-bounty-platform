package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.forum.ForumMessageCreateRequest;
import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ForumService {
    ForumMessageViewDTO createMessage(String currentUserEmail, ForumMessageCreateRequest req);
    Page<ForumMessageViewDTO> listPublic(Pageable pageable);
    Page<ForumMessageViewDTO> listAll(Pageable pageable); // admin
    void setStatus(Long messageId, String status);        // admin: ACTIVE|DELETED
}
