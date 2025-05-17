CREATE TABLE notification (
                              notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              user_id BIGINT NOT NULL,
                              message TEXT NOT NULL,
                              is_read BOOLEAN DEFAULT FALSE,
                              sent_at DATETIME NOT NULL,

                              CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
