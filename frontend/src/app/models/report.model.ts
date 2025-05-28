
export interface ReportRequest {
  programId: number;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ReportResponse {
  id: number;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  researcher: string;
  submittedAt: string;
  programTitle: string;
}

