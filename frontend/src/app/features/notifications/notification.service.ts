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
}
