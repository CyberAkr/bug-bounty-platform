
export interface ReportRequest {
  programId: number;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ReportResponse {
  id: number;
  title: string;
  severity: string;
  status: string;
  researcher: string;
  submittedAt: string;
}
