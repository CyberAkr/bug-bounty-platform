
package be.bugbounty.backend.service;

import be.bugbounty.backend.model.Notification;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.NotificationRepository;
import be.bugbounty.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserUserId(userId);
    }

    public Notification sendNotificationToUser(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setSentAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }
}
