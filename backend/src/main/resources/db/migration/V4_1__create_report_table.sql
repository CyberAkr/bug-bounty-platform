CREATE TABLE report (
                        report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        researcher_id BIGINT NOT NULL,
                        program_id BIGINT NOT NULL,
                        title LONGTEXT,
                        severity VARCHAR(10),
                        submitted_at DATETIME NOT NULL,
                        status VARCHAR(20),
                        admin_comment TEXT,

                        CONSTRAINT fk_report_researcher FOREIGN KEY (researcher_id) REFERENCES users(user_id),
                        CONSTRAINT fk_report_program FOREIGN KEY (program_id) REFERENCES audit_program(program_id)
);
