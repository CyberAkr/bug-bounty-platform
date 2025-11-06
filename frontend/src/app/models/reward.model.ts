export interface RewardPayment {
  paymentId: number;
  report: { reportId: number; title?: string } | any; // backend renvoie l'entité; on garde souple
  amount: number;
  paymentDate: string; // ISO
  proofUrl?: string | null;
}
