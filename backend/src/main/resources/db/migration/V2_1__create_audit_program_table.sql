CREATE TABLE audit_program (
                               program_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               company_id BIGINT NOT NULL,
                               title VARCHAR(150) NOT NULL,
                               description TEXT,
                               status VARCHAR(20),

                               CONSTRAINT fk_audit_program_company FOREIGN KEY (company_id) REFERENCES users(user_id)
);
