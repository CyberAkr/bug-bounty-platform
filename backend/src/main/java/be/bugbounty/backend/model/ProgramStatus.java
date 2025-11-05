package be.bugbounty.backend.model;

/** Statut d’un programme de bug bounty. */
public enum ProgramStatus {
    // Flux de création/paiement
    PENDING,     // créé en brouillon, en attente de paiement/validation
    APPROVED,    // validé après paiement (publisable)

    // Cycle de vie public
    DRAFT,       // (optionnel) brouillon interne
    PUBLISHED,   // publié (visible)
    ACTIVE,      // en cours
    PAUSED,      // suspendu
    CLOSED,      // terminé
    ARCHIVED     // archivé
}
