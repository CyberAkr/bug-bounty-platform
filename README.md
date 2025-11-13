🛡️ Bug Bounty Platform – Low-Cost Citizen Security for Belgium

Plateforme de Bug Bounty citoyenne, low cost et dédiée au marché belge, permettant aux entreprises de sécuriser leurs sites et applications tout en offrant aux chercheurs en cybersécurité un espace d’apprentissage, de partage et de valorisation professionnelle.
Inspirée des plateformes professionnelles, mais adaptée aux PME belges grâce à un modèle simple, abordable et citoyen.

🚀 Vision du projet

La cybersécurité est souvent inaccessible pour les petites entreprises.
Ce projet vise à changer cela — en créant une plateforme nationale où :

Les entreprises belges publient des programmes d’audit à bas coût.

Les chercheurs participent par engagement citoyen et sont récompensés symboliquement.

Les administrateurs supervisent et valident les rapports.

La mission : sécuriser l’espace numérique belge de façon collaborative.

🏗️ Architecture Technique
Frontend

Framework : Angular 19+ (standalone components)

TailwindCSS + Angular Material

Signals (signal(), computed(), effect())

Injection via inject()

Architecture feature-based

Internationalisation : ngx-translate

Communication API : HttpClient + interceptors (JWT)

Responsive design + thème clair/sombre

📁 Voir la structure complète des fichiers frontend


Backend

Spring Boot 3+

API REST full stateless

Spring Security + JWT

Flyway migrations

Validation DTO

Système de rôles : ADMIN, COMPANY, RESEARCHER

Services : Programmes, Récompenses, Challenges, Forum, Rapports, Notifications…

📁 Voir la structure backend complète


👤 Rôles & Permissions
Chercheur

Accès aux programmes ouverts

Soumission de rapports

Consultation du classement

Participer aux challenges

Forum communautaire

Entreprise

Créer et gérer des programmes d’audit

Suivre les rapports reçus

Télécharger les preuves

Gérer le périmètre, paiements, récompenses

Administrateur

Gestion complète :

Utilisateurs

Rapports

Programmes

Récompenses

Badges & challenges

Forum

Vulnérabilités

📦 Fonctionnalités principales
🔐 Authentification & sécurité

Inscription + vérification email

JWT + refresh

Gestion des rôles

Middleware client (interceptor Angular)

🏢 Entreprises

Création de programmes d’audit

Upload des preuves

Dashboard complet

🧑‍💻 Chercheurs

Liste des programmes

Soumission de rapport (éditeur rich text TinyMCE)

Suivi des statuts

Badges + classement

Participation challenges hebdo

🛠️ Admin

Modération forum

Validation rapports

Récompenses / preuves de paiement

Gestion utilisateurs

Panneau complet

📩 Notifications

En temps réel (stockées en base)

Interface UI claire (Angular Material)

🗃️ Base de données

Flyway gère les migrations SQL :

Utilisateurs

Programmes

Rapports

Récompenses

Badges

Challenges

Forum

Notifications

🧪 Tests & qualité

Validation DTO backend

Guards Angular

Token interceptor handling

Sécurité Spring Security testée

⚙️ Installation & lancement
Backend
cd backend
mvn spring-boot:run

Frontend
cd frontend
npm install
ng serve


L'application sera disponible sur :

Frontend : http://localhost:4200

Backend : http://localhost:8080

🌍 Internationalisation

Dictionnaires :
/assets/i18n/fr.json
/assets/i18n/en.json

🧭 Roadmap

 Intégration vraie temps réel WebSocket

 Système de paiement Stripe complet entreprise → plateforme

 Export PDF rapports

 Mode mobile avancé

 API publique (programmes listables)

📜 Licence

Projet étudiant / démonstration — pas destiné à un usage commercial sans adaptation.

🤝 Contribution

Les pull requests sont les bienvenues !
Pour commencer :

Fork du repo

Création d'une branche

Commit clair et structuré

Pull request détaillée

🧑‍💻 Auteur

Projet réalisé pour un TFE dans le domaine de la cybersécurité et du bug bounty en Belgique.
Document de vision du projet :
