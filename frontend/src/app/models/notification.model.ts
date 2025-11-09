export interface NotificationResponse {
  id: number;
  message: string;
  sentAt: string;
  isRead: boolean;
  type?: 'REWARD' | 'REPORT' | 'SYSTEM' | 'INFO' | string;

}
