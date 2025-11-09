import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse } from '@app/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  getMyNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>('/api/notifications');
  }

  markRead(id: number) { return this.http.post<void>(`/api/notifications/${id}/read`, {}); }
  markUnread(id: number) { return this.http.post<void>(`/api/notifications/${id}/unread`, {}); }
  markAllRead() { return this.http.post<void>('/api/notifications/read-all', {}); }

}
