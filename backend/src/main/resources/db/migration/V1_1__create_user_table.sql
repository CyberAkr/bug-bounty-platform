CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    profile_photo VARCHAR(255),
    preferred_language VARCHAR(10),
    username VARCHAR(100) UNIQUE,
    bio TEXT,
    company_number VARCHAR(50),
    verification_document VARCHAR(255),
    verification_status VARCHAR(20),
    is_banned BOOLEAN DEFAULT FALSE,
    point INT DEFAULT 0
);
