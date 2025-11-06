import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsersService,
  User,
  AdminUserUpdate,
  AdminUserCreate,
} from './users.service';
import { UserRowComponent } from './user-row/user-row.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserRowComponent],
  template: `
    <div class="mx-auto max-w-7xl p-6 space-y-6">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Gestion des utilisateurs</h1>
      </header>

      <!-- Formulaire création -->
      <section class="rounded-xl border p-4">
        <h2 class="font-medium mb-3">Créer un utilisateur</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input class="border rounded p-2 text-sm" placeholder="Prénom" [(ngModel)]="newUser().firstName">
          <input class="border rounded p-2 text-sm" placeholder="Nom" [(ngModel)]="newUser().lastName">
          <input class="border rounded p-2 text-sm" placeholder="Username" [(ngModel)]="newUser().username">
          <input class="border rounded p-2 text-sm" placeholder="Email" [(ngModel)]="newUser().email">
          <input class="border rounded p-2 text-sm" placeholder="Mot de passe" [(ngModel)]="newUser().password" type="password">

          <select class="border rounded p-2 text-sm" [(ngModel)]="newUser().role">
            <option value="researcher">researcher</option>
            <option value="company">company</option>
            <option value="admin">admin</option>
          </select>

          <select class="border rounded p-2 text-sm" [(ngModel)]="newUser().verificationStatus">
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" [(ngModel)]="newUser().banned"> Banni
          </label>

          @if (newUser().role === 'company') {
            <input class="border rounded p-2 text-sm col-span-1 sm:col-span-2"
                   placeholder="Numéro d'entreprise"
                   [(ngModel)]="newUser().companyNumber">
            <input class="border rounded p-2 text-sm col-span-1 sm:col-span-2"
                   placeholder="Document de vérification (lien ou ref)"
                   [(ngModel)]="newUser().verificationDocument">
          }
        </div>

        <div class="mt-3">
          <button (click)="onCreate()"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded"
                  [disabled]="!canCreate()">
            ➕ Créer
          </button>
        </div>
      </section>

      @if (loading()) {
        <div class="rounded-xl border p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      } @else {
        @if (users().length) {
          <div class="rounded-xl border overflow-x-auto">
            <table class="w-full table-fixed text-sm border-collapse">
              <colgroup>
                <col class="w-[18%]" /><col class="w-[24%]" /><col class="w-[12%]" />
                <col class="w-[12%]" /><col class="w-[12%]" /><col class="w-[10%]" /><col class="w-[12%]" />
              </colgroup>
              <thead class="bg-gray-50">
                <tr class="text-left">
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Username</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Email</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Rôle</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Statut</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Vérification</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Document</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.user_id ?? $index) {
                  <tr app-user-row
                      [user]="u"
                      (update)="onUpdate($event)"
                      (removed)="onDelete($event)"
                      (downloadDoc)="onDownload($event)">
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="rounded-xl border p-10 text-center">
            <div class="text-lg font-medium">Aucun utilisateur</div>
          </div>
        }
      }

      @if (error()) {
        <div class="rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
          {{ error() }}
        </div>
      }
    </div>
  `,
})
export class UsersComponent {
  private service = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // état du formulaire
  newUser = signal<AdminUserCreate>({
    firstName: '', lastName: '', username: '',
    email: '', password: '', role: 'researcher',
    verificationStatus: 'PENDING', banned: false,
  });

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAllUsers().subscribe({
      next: data => this.users.set(data),
      error: err => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  // company => companyNumber requis
  canCreate() {
    const n = this.newUser();
    const baseOk = !!(n.firstName && n.lastName && n.username && n.email && n.password && n.role);
    const companyOk = n.role !== 'company' || !!n.companyNumber;
    return baseOk && companyOk;
  }

  onCreate() {
    this.service.createUser(this.newUser()).subscribe({
      next: () => {
        this.newUser.set({
          firstName: '', lastName: '', username: '',
          email: '', password: '', role: 'researcher',
          verificationStatus: 'PENDING', banned: false,
        });
        this.load();
      },
      error: err => this.error.set(err?.error || 'Échec de la création'),
    });
  }

  onUpdate(ev: { id: number; dto: AdminUserUpdate }) {
    this.service.updateUser(ev.id, ev.dto).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la mise à jour'),
    });
  }

  onDelete(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.service.deleteUser(id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la suppression'),
    });
  }

  // Téléchargement du PDF de vérification
  onDownload(userId: number) {
    this.service.downloadVerification(userId).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) return alert('Document introuvable ou vide.');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-${userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        if (err?.status === 404) alert('Document introuvable');
        else if (err?.status === 401 || err?.status === 403) alert('Non autorisé');
        else alert('Erreur lors du téléchargement');
      }
    });
  }
}
