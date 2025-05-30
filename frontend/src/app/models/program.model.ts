
export interface AuditProgramRequest {
  title: string;
  description: string;
}

export interface AuditProgramResponse {
  id: number;
  title: string;
  description: string;
  companyName: string;
  status: 'PENDING' | 'APPROVED';
}

