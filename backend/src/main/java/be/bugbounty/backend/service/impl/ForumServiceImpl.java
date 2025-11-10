// src/main/java/be/bugbounty/backend/service/impl/ForumServiceImpl.java
package be.bugbounty.backend.service.impl;

import be.bugbounty.backend.dto.forum.ForumMessageCreateRequest;
import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import be.bugbounty.backend.model.ForumMessage;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.ForumMessageRepository;
import be.bugbounty.backend.repository.UserRepository;
import be.bugbounty.backend.service.ForumService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumServiceImpl implements ForumService {

    private final ForumMessageRepository forumRepo;
    private final UserRepository userRepo;

    @Override
    public ForumMessageViewDTO createMessage(String currentUserEmail, ForumMessageCreateRequest req) {
        String content = req.content() == null ? "" : req.content().trim();
        if (content.isEmpty() || content.length() > 2000) {
            throw new IllegalArgumentException("Invalid content");
        }

        User user = userRepo.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (user.isBanned()) {
            throw new SecurityException("User banned");
        }

        ForumMessage msg = new ForumMessage();
        msg.setUser(user);
        msg.setContent(content);
        msg.setPostedAt(LocalDateTime.now());
        msg.setMessageStatus(ForumMessage.MessageStatus.ACTIVE);

        ForumMessage saved = forumRepo.save(msg);
        return map(saved);
    }

    @Override
    public Page<ForumMessageViewDTO> listPublic(Pageable pageable) {
        return forumRepo
                .findAllByMessageStatusOrderByPostedAtDesc(ForumMessage.MessageStatus.ACTIVE, pageable)
                .map(this::map);
    }

    @Override
    public Page<ForumMessageViewDTO> listAll(Pageable pageable) {
        return forumRepo.findAll(pageable).map(this::map);
    }

    @Override
    public void setStatus(Long messageId, String status) {
        ForumMessage msg = forumRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        ForumMessage.MessageStatus st = ForumMessage.MessageStatus.valueOf(status.toUpperCase());
        msg.setMessageStatus(st);
        forumRepo.save(msg);
    }

    private ForumMessageViewDTO map(ForumMessage m) {
        var author = new ForumMessageViewDTO.AuthorDTO(
                m.getUser().getUserId(),
                m.getUser().getUsername(),
                m.getUser().getRole(),
                m.getUser().isBanned(),
                m.getUser().getProfilePhoto()
        );
        return new ForumMessageViewDTO(
                m.getMessageId(),
                m.getContent(),
                m.getPostedAt() == null ? null : m.getPostedAt().toString(),
                m.getMessageStatus() == null ? "ACTIVE" : m.getMessageStatus().name(),
                author
        );
    }
}
