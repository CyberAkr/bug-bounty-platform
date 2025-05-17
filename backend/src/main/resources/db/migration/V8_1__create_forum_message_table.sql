CREATE TABLE forum_message (
                               message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               content TEXT NOT NULL,
                               posted_at DATETIME NOT NULL,
                               message_status VARCHAR(20),

                               CONSTRAINT fk_forum_message_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
