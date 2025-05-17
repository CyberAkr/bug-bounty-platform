CREATE TABLE badge (
                       badge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100) UNIQUE NOT NULL,
                       description TEXT
);
