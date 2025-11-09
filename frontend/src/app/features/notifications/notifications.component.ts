import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotificationService } from '@app/features/notifications/notification.service';
import { NotificationResponse } from '@app/models/notification.model';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltip],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  private api = inject(NotificationService);

  notifications = signal<NotificationResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
    // (optionnel) SSE pour push temps réel :
    // this.api.stream().subscribe(n => this.notifications.set([n, ...this.notifications()]));
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMyNotifications().subscribe({
      next: list => { this.notifications.set(list ?? []); this.loading.set(false); },
      error: err => { this.error.set(err?.error || 'Erreur de chargement.'); this.loading.set(false); }
    });
  }

  unreadCount() { return this.notifications().filter(n => !n.isRead).length; }

  toggleRead(n: NotificationResponse) {
    if (!n?.id) return;
    const action$ = n.isRead ? this.api.markUnread(n.id) : this.api.markRead(n.id);
    action$.subscribe({
      next: () => {
        this.notifications.update(arr => arr.map(x => x.id === n.id ? { ...x, isRead: !n.isRead } : x));
      }
    });
  }

  markAllRead() {
    this.api.markAllRead().subscribe({
      next: () => this.notifications.update(arr => arr.map(n => ({ ...n, isRead: true })))
    });
  }

  iconFor(type?: string | null): string {
    switch ((type || '').toUpperCase()) {
      case 'REWARD': return 'payments';
      case 'REPORT': return 'description';
      case 'SYSTEM': return 'notifications';
      case 'INFO':   return 'info';
      default:       return 'notifications';
    }
  }

  trackNotif = (_: number, n: NotificationResponse) => n.id ?? n.sentAt;
}
