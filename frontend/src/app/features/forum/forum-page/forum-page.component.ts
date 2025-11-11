// src/app/features/forum/forum-page/forum-page.component.ts
import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
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
import { ForumMessage, ForumService, Page, ForumEvent } from '@app/features/forum/forum.service';
import { UsersService } from '@app/features/admin/users/users.service';

type Me = { role: string; banned: boolean } | null;

const MAX_LEN = 300; // 👈 nouvelle limite

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
export class ForumPageComponent implements OnDestroy {
  private forum = inject(ForumService);
  private userService = inject(UserService);
  private adminUsers = inject(UsersService);

  draft = signal<string>('');
  errorMsg = signal<string | null>(null);

  me = signal<Me>(null);
  page = signal<number>(0);
  size = signal<number>(20);
  totalPages = signal<number>(1);
  loading = signal<boolean>(false);
  messages = signal<ForumMessage[]>([]);

  private closeStream: (() => void) | null = null;
  private adminClaim = signal<boolean>(false); // 👈 fallback via JWT

  constructor() {
    this.loadCurrentUser();
    this.hydrateAdminFromJWT(); // 👈 lit le token si besoin
    this.fetch();
    this.closeStream = this.forum.connectStream((evt) => this.onEvent(evt));
  }

  ngOnDestroy() { if (this.closeStream) this.closeStream(); }

  // --------- rôle courant (API) ----------
  private loadCurrentUser() {
    const us: any = this.userService as any;
    const obs: Observable<any> =
      (typeof us.me === 'function' ? us.me() :
        typeof us.profile === 'function' ? us.profile() :
          of(null));
    obs.subscribe((u: any) => {
      if (u) {
        this.me.set({ role: (u.role || '').toLowerCase(), banned: !!(u.banned ?? u.isBanned) });
      } else {
        this.me.set(null);
      }
    });
  }

  // --------- rôle courant (JWT fallback) ----------
  private hydrateAdminFromJWT() {
    const raw = localStorage.getItem('auth_token');
    if (!raw) return;
    try {
      const payload = JSON.parse(atob(raw.split('.')[1] || ''));
      // cas classiques: "role": "ADMIN" ou authorities: ["ROLE_ADMIN"]
      const role = (payload?.role || payload?.Role || '').toString().toLowerCase();
      const auths: string[] = Array.isArray(payload?.authorities) ? payload.authorities : [];
      const isAdmin = role === 'admin' || auths.includes('ROLE_ADMIN');
      this.adminClaim.set(isAdmin);
    } catch { /* ignore */ }
  }

  // --------- SSE handler ----------
  private onEvent(evt: ForumEvent) {
    if (evt.type === 'CREATED') {
      const m = evt.payload;
      this.messages.update(prev => prev.find(x => x.id === m.id) ? prev : [m, ...prev]);
    } else if (evt.type === 'STATUS') {
      const { id, status } = evt.payload;
      this.messages.update(prev =>
        status === 'DELETED'
          ? prev.filter(x => x.id !== id)
          : prev.map(x => x.id === id ? ({ ...x, status }) : x)
      );
    }
  }

  // --------- helpers UI ----------
  isAdmin = (): boolean => (this.me()?.role === 'admin') || this.adminClaim();
  isBanned = (): boolean => !!this.me()?.banned;

  canPost = computed<boolean>(() =>
    !this.loading() && !this.isBanned() &&
    this.draft().trim().length > 0 && this.draft().trim().length <= MAX_LEN
  );

  trackById = (_: number, m: ForumMessage) => m.id;
  maxLen = MAX_LEN; // exposé au template

  // --------- data ----------
  fetch(): void {
    this.loading.set(true);
    this.forum.list(this.page(), this.size()).subscribe({
      next: (res: Page<ForumMessage>) => {
        const content = res?.content ?? [];
        this.messages.update(prev => [...prev, ...content]);
        this.totalPages.set(res?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore(): void {
    if (!this.hasMore()) return;
    this.page.update(p => p + 1);
    this.fetch();
  }

  hasMore = (): boolean => this.page() + 1 < this.totalPages();

  // --------- actions ----------
  post(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.errorMsg.set(null);
    this.loading.set(true);

    this.forum.create(text).subscribe({
      next: (created: ForumMessage) => {
        this.messages.update(prev => prev.find(x => x.id === created.id) ? prev : [created, ...prev]);
        this.draft.set('');
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        if (err?.status === 403) this.errorMsg.set('forum.banned');
        else if (err?.status === 400) this.errorMsg.set('forum.tooLong'); // si back refuse
        else this.errorMsg.set('forum.error');
      }
    });
  }

  toggleStatus(m: ForumMessage): void {
    if (!this.isAdmin()) return;
    const next = m.status === 'ACTIVE' ? 'DELETED' : 'ACTIVE';
    this.forum.adminSetStatus(m.id, next as any).subscribe();
    // le SSE synchronise tout le monde
  }

  toggleBan(authorId: number, banned: boolean) {
    if (!this.isAdmin()) return;
    this.adminUsers.updateUser(authorId, { banned: !banned }).subscribe();
  }
}
