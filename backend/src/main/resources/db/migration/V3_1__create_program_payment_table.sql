CREATE TABLE program_payment (
                                 payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 program_id BIGINT NOT NULL,
                                 amount DECIMAL(10,2) NOT NULL,
                                 payment_date DATETIME NOT NULL,
                                 status VARCHAR(20),

                                 CONSTRAINT fk_program_payment FOREIGN KEY (program_id) REFERENCES audit_program(program_id)
);
