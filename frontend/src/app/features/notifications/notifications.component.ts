import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@app/features/notifications/notification.service';
import { NotificationResponse } from '@app/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  notifications = signal<NotificationResponse[]>([]);

  ngOnInit(): void {
    this.notificationService.getMyNotifications().subscribe((data) => {
      this.notifications.set(data);
    });
  }
}
