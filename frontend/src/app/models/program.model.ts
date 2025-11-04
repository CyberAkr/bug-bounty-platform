// Types communs côté front pour les Programmes

export type ProgramStatus = 'PENDING' | 'APPROVED' | 'PAUSED' | 'CLOSED';

// ↳ correspond au DTO renvoyé par le backend (AuditProgramResponseDTO)
export interface AuditProgramResponse {
  id: number;                 // p.getProgramId() mappé côté backend
  title: string;
  description: string;        // HTML (affichage via [innerHTML] sanitisé)
  companyName: string;        // nom public de l’entreprise
  status: ProgramStatus;      // 'PENDING' | 'APPROVED' ...
}

// Modèle de brouillon envoyé quand on crée un programme
export interface RewardRow {
  severity: 'low' | 'medium' | 'high' | 'critical';
  min: number;
  max: number;
}

export interface Target {
  type: 'web' | 'api' | 'mobile' | 'other';
  value: string;
}

export interface ProgramDraftDto {
  title: string;
  description: string;     // HTML sanitisé
  targets: Target[];
  inScope: string[];
  outOfScope: string[];
  rewards: RewardRow[];
  disclosure: 'no' | 'partial' | 'full';
  contactEmail?: string;
}
