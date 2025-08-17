INSERT INTO users (
    first_name, last_name, email, password_hash, role, username, verification_status, point
) VALUES
      ('Alice', 'Dupont', 'alice@example.com', 'hashedpwd1', 'researcher', 'alice123', 'APPROVED', 150),
      ('Jean', 'Martin', 'jean@entreprise.be', 'hashedpwd2', 'company', 'jeanCEO', 'PENDING', 0),
      ('Admin', 'Root', 'admin@site.be', 'hashedpwd3', 'admin', 'adminmaster', 'APPROVED', 9999);
      ('Alice', 'Dupont', 'alice@example.com', 'hashedpwd1', 'researcher', 'alice123', 'APPROVED', 150),
      ('Jean', 'Martin', 'jean@entreprise.be', 'hashedpwd2', 'company', 'jeanCEO', 'PENDING', 0),
      ('Admin', 'Root', 'admin@site.be', 'hashedpwd3', 'admin', 'adminmaster', 'APPROVED', 9999),
      ('Sophie', 'Lambert', 'sophie.lambert@mail.com', 'hashedpwd4', 'researcher', 'sophie_l', 'APPROVED', 320),
      ('Thomas', 'Renard', 'thomas.renard@mail.com', 'hashedpwd5', 'researcher', 'renard_th', 'PENDING', 80),
      ('Camille', 'Vermeulen', 'camille.v@entreprise.be', 'hashedpwd6', 'company', 'camilleCEO', 'APPROVED', 0),
      ('Olivier', 'Masson', 'olivier.masson@mail.com', 'hashedpwd7', 'researcher', 'masson_oliv', 'APPROVED', 500),
      ('Emma', 'Petit', 'emma.petit@mail.com', 'hashedpwd8', 'researcher', 'emma_p', 'REJECTED', 20),
      ('Lucas', 'Dupuis', 'lucas.dupuis@mail.com', 'hashedpwd9', 'researcher', 'lucas_dp', 'APPROVED', 200),
      ('Claire', 'Moreau', 'claire.moreau@mail.com', 'hashedpwd10', 'company', 'claireCEO', 'PENDING', 0),
      ('Hugo', 'Marchand', 'hugo.marchand@mail.com', 'hashedpwd11', 'researcher', 'hugo_m', 'APPROVED', 150);