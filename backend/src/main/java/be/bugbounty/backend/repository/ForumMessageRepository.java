package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.ForumMessage;
import be.bugbounty.backend.model.ForumMessage.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumMessageRepository extends JpaRepository<ForumMessage, Long> {
    Page<ForumMessage> findAllByMessageStatusOrderByPostedAtDesc(MessageStatus status, Pageable pageable);
}
