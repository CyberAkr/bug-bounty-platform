// src/app/features/forum/forum-page/forum-page.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '@app/core/auth/user.service';
import { Observable, of } from 'rxjs';
import {ForumMessage, ForumService, Page} from '@app/features/forum/forum.service';

type Me = { role: string; banned: boolean } | null;

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule
  ],
  templateUrl: './forum-page.component.html'
})
export class ForumPageComponent {
  private forum = inject(ForumService);
  private userService = inject(UserService);

  draft = signal<string>('');
  errorMsg = signal<string | null>(null);

  me = signal<Me>(null);
  page = signal<number>(0);
  size = signal<number>(20);
  totalPages = signal<number>(1);
  loading = signal<boolean>(false);
  messages = signal<ForumMessage[]>([]);

  constructor() {
    // ✅ Récupère profil courant de manière générique
    this.loadCurrentUser();

    // ✅ Charge les messages
    this.fetch();
  }

  private loadCurrentUser() {
    const us: any = this.userService as any;

    // on tente me() ou profile()
    const obs: Observable<any> =
      (typeof us.me === 'function' ? us.me() :
        typeof us.profile === 'function' ? us.profile() :
          of(null));

    obs.subscribe((u: any) => {
      if (u) {
        this.me.set({
          role: (u.role || '').toLowerCase(),
          banned: !!(u.banned ?? u.isBanned)
        });
      } else {
        this.me.set(null);
      }
    });
  }

  isAdmin = (): boolean => (this.me()?.role || '') === 'admin';
  isBanned = (): boolean => !!this.me()?.banned;

  canPost = computed<boolean>(() =>
    !this.loading() &&
    !this.isBanned() &&
    this.draft().trim().length > 0 &&
    this.draft().trim().length <= 2000
  );

  trackById = (_: number, m: ForumMessage) => m.id;

  fetch(): void {
    this.loading.set(true);
    this.forum.list(this.page(), this.size()).subscribe({
      next: (res: Page<ForumMessage>) => {
        const content = res?.content ?? [];
        this.messages.update((prev) => [...prev, ...content]);
        this.totalPages.set(res?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore(): void {
    if (!this.hasMore()) return;
    this.page.update((p) => p + 1);
    this.fetch();
  }

  hasMore = (): boolean => this.page() + 1 < this.totalPages();

  post(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.errorMsg.set(null);
    this.loading.set(true);

    this.forum.create(text).subscribe({
      next: (created: ForumMessage) => {
        this.messages.update((prev) => [created, ...prev]);
        this.draft.set('');
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        if (err?.status === 403) {
          this.errorMsg.set('forum.banned');
        } else {
          this.errorMsg.set('forum.error');
        }
      }
    });
  }

  toggleStatus(m: ForumMessage): void {
    if (!this.isAdmin()) return;
    const next = m.status === 'ACTIVE' ? 'DELETED' : 'ACTIVE';
    this.forum.adminSetStatus(m.id, next as any).subscribe({
      next: () => {
        this.messages.update((prev) =>
          next === 'DELETED'
            ? prev.filter(x => x.id !== m.id)
            : prev.map(x => x.id === m.id ? ({ ...x, status: next }) : x)
        );
      }
    });
  }
}
