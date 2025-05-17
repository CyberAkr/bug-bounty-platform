CREATE TABLE reward_payment (
                                payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                report_id BIGINT NOT NULL,
                                amount DECIMAL(10,2) NOT NULL,
                                payment_date DATETIME NOT NULL,

                                CONSTRAINT fk_reward_payment FOREIGN KEY (report_id) REFERENCES report(report_id)
);
