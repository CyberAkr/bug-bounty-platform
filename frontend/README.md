🛡 Projet Bug Bounty - Plateforme citoyenne belge

🎯 Objectif

Créer une plateforme de bug bounty locale et accessible pour les PME belges, permettant aux chercheurs de contribuer, se former et être valorisés tout en renforçant la cybersécurité nationale.

🧱 Architecture technique

Frontend : Angular 19+, standalone components, signal(), inject(), architecture feature-based

Backend : Spring Boot 3 REST API, sécurité JWT stateless

Base de données : MySQL / SQL (modèle dans bugbounty.sql)

🔐 Authentification et sécurité

JWT stocké dans localStorage, injecté via HttpInterceptor

Authentification via /api/auth/signin / /register

Route /api/user/me pour vérifier l'utilisateur courant

Spring Security configuré via JwtAuthenticationFilter et SecurityConfig

Guards Angular pour protéger les routes (auth.guard.ts, admin.guard.ts)

🧑‍💻 Fonctionnalités principales

✅ Authentification & gestion utilisateur

Inscription, connexion, déconnexion avec JWT

Mise à jour du profil personnel (photo, bio, langue)

Upload de document de vérification pour les entreprises

Suppression de compte

🏆 Classement (Ranking)

Affichage des 10 meilleurs chercheurs via /api/rankings

Composant Angular RankingComponent

Pseudos cliquables redirigeant vers /user/:id

Profils publics affichés avec ProfilePublicComponent

🧾 Rapports de vulnérabilités

Création de rapports de bug liés à un programme

Listing des rapports personnels dans MyReportsComponent

Statut : en attente, validé, rejeté

🎯 Programmes d'audit

Création de programmes par les entreprises

Détails affichés pour les chercheurs

Soumission de rapports sur un programme

💰 Paiements & récompenses

Paiement par programme (côté entreprise)

Récompenses en points pour les chercheurs

Historique des transactions (structure en place)

📢 Forum communautaire

Messages, catégories, participations

Accessibles uniquement aux membres connectés

🎖 Système de badges

Attribution de badges selon points et activités (structure préparée)

🔔 Notifications

Notifications en cas de validation/rejet de rapport ou message

Composant notifications.routes.ts

🧪 Tests techniques

Test JWT via /api/user/me

JWT intercepté dans Angular + auth.service.ts

Guards vérifiant l'accès aux routes sensibles

📁 Organisation du projet

Backend (Spring Boot)

controller/ : Auth, User, Report, Payment, Ranking

model/ : User, Report, Program, Badge, etc.

repository/ : JPA Repos

security/ : JWT Filter, SecurityConfig

Frontend (Angular)

core/ : Auth guards, interceptors

shared/ : Pipes (username, date format)

layout/ : Header, Footer, Sidebar

features/

auth/ : Login, Register

users/ : Profile, Settings, ProfilePublic

programs/ : Create, View

reports/ : My Reports

rewards/, payments/, forum/, admin/, etc.

🛣 Roadmap future (extraits)

Affichage des badges sur profil public ✅

Classement hebdomadaire ✔️

Statistiques globales (dashboard admin) ✔️

Recherche et filtrage dans les programmes ✔️

Export PDF des rapports (côté admin) ✔️

📎 Annexes disponibles

bugbounty.sql : Structure de la base

Diagrammes.drawio : Cas d'utilisation, navigation, contexte, classe

Business_Plan_Bug_bounty.docx

prototype_navigableBugBounty.pptx : UI

Cahier_de_charges_fonctionnel.docx : Spécifications complètes

