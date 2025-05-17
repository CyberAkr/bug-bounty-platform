CREATE TABLE challenge (
                           challenge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           title VARCHAR(150) NOT NULL,
                           description TEXT,
                           program_id BIGINT NOT NULL,
                           start_date DATETIME NOT NULL,
                           end_date DATETIME NOT NULL,

                           CONSTRAINT fk_challenge_program FOREIGN KEY (program_id) REFERENCES audit_program(program_id)
);
