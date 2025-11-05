ALTER TABLE audit_program
    ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN deleted_at DATETIME(6) NULL,
    ADD INDEX idx_audit_program_is_deleted (is_deleted);
