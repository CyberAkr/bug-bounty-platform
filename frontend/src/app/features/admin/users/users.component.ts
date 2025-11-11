import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsersService,
  User,
  AdminUserUpdate,
  AdminUserCreate,
} from './users.service';
import { UserRowComponent } from './user-row/user-row.component';
import { TranslateModule } from '@ngx-translate/core';

// ✅ barre de filtres réutilisable
import { ListControlsComponent } from '@app/shared/components/list-controls/list-controls.component';

type SortValue = 'usernameAsc' | 'usernameDesc' | 'emailAsc' | 'emailDesc' | 'roleAsc' | 'verifAsc';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserRowComponent, TranslateModule, ListControlsComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private service = inject(UsersService);

  // Données brutes & état
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Contrôles (list-controls)
  querySig     = signal<string>('');
  sortSig      = signal<SortValue>('usernameAsc');
  pageIndexSig = signal<number>(0);
  pageSizeSig  = signal<number>(10);
  pageSizeOptions = [10, 25, 50];

  // Options de tri (i18n réutilisées)
  sortOptions = [
    { value: 'usernameAsc', label: 'ranking.sort.nameAsc'   },
    { value: 'usernameDesc',label: 'ranking.sort.nameDesc'  },
    { value: 'emailAsc',    label: 'list.sort.titleAsc'     },  // libellé générique
    { value: 'emailDesc',   label: 'list.sort.titleDesc'    },
    { value: 'roleAsc',     label: 'common.status'          },
    { value: 'verifAsc',    label: 'admin.users.table.verification' }
  ];

  // Pagination calculée
  totalSig = computed(() => this.filteredSorted().length);
  pageRows = computed<User[]>(() => {
    const start = this.pageIndexSig() * this.pageSizeSig();
    return this.filteredSorted().slice(start, start + this.pageSizeSig());
  });

  newUser = signal<AdminUserCreate>({
    firstName: '', lastName: '', username: '',
    email: '', password: '', role: 'researcher',
    verificationStatus: 'PENDING', banned: false,
  });

  constructor() { this.load(); }

  /* ------------------------ Fetch ------------------------ */
  load() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAllUsers().subscribe({
      next: data => this.users.set(data ?? []),
      error: err => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  /* --------------------- List-controls ------------------- */
  onControlsChange(e: { pageIndex: number; pageSize: number; query: string; sort: string }) {
    this.pageIndexSig.set(e.pageIndex);
    this.pageSizeSig.set(e.pageSize);
    this.querySig.set(e.query);
    this.sortSig.set((e.sort as SortValue) || 'usernameAsc');
  }

  private filteredSorted(): User[] {
    const q = this.querySig().toLowerCase().trim();
    let rows = this.users();

    // recherche : username / email / role
    if (q) {
      rows = rows.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    }

    // tri
    const by = this.sortSig();
    rows = [...rows].sort((a, b) => {
      const uA = (a.username || '').toLowerCase();
      const uB = (b.username || '').toLowerCase();
      const eA = (a.email || '').toLowerCase();
      const eB = (b.email || '').toLowerCase();
      const rA = (a.role || '').toString();
      const rB = (b.role || '').toString();
      const vA = (a.verification_status || 'PENDING').toString();
      const vB = (b.verification_status || 'PENDING').toString();

      switch (by) {
        case 'usernameAsc':  return uA.localeCompare(uB);
        case 'usernameDesc': return uB.localeCompare(uA);
        case 'emailAsc':     return eA.localeCompare(eB);
        case 'emailDesc':    return eB.localeCompare(eA);
        case 'roleAsc':      return rA.localeCompare(rB);
        case 'verifAsc':     return vA.localeCompare(vB);
        default:             return uA.localeCompare(uB);
      }
    });

    return rows;
  }

  /* --------------------- Table actions ------------------- */
  trackUser = (_: number, u: User) => u.user_id ?? _;

  canCreate() {
    const n = this.newUser();
    const baseOk =
      !!n.firstName && !!n.lastName && !!n.username &&
      !!n.email && !!n.password && !!n.role;
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
        setTimeout(() => URL.revokeObjectURL(url), 800);
      },
      error: (err) => {
        if (err?.status === 404) alert('Document introuvable');
        else if (err?.status === 401 || err?.status === 403) alert('Non autorisé');
        else alert('Erreur lors du téléchargement');
      }
    });
  }
}
