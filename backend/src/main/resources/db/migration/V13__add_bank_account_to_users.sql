-- V13 : Ajout du champ optionnel bank_account (IBAN) sur la table users
ALTER TABLE users
    ADD COLUMN bank_account VARCHAR(34);
