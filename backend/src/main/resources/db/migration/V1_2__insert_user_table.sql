INSERT INTO users (
    first_name, last_name, email, password_hash, role, username, verification_status, point
) VALUES
      ('Alice', 'Dupont', 'alice@example.com', 'hashedpwd1', 'researcher', 'alice123', 'APPROVED', 150),
      ('Jean', 'Martin', 'jean@entreprise.be', 'hashedpwd2', 'company', 'jeanCEO', 'PENDING', 0),
      ('Admin', 'Root', 'admin@site.be', 'hashedpwd3', 'admin', 'adminmaster', 'APPROVED', 9999);
