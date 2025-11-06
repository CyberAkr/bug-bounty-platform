-- Ajout d'un champ de preuve et contrainte d'unicité (une reward par rapport)

ALTER TABLE reward_payment
    ADD COLUMN proof_url VARCHAR(255) NULL AFTER payment_date;

-- Empêche la création de plusieurs rewards pour le même rapport
CREATE UNIQUE INDEX ux_reward_payment_report ON reward_payment (report_id);
