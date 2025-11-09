import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VulnerabilitiesService, VulnerabilityType } from './vulnerabilities.service';

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './vulnerabilities.component.html',
  styleUrls: ['./vulnerabilities.component.css']
})
export class VulnerabilitiesComponent implements OnInit {
  private service = inject(VulnerabilitiesService);

  types = signal<VulnerabilityType[]>([]);
  newType = '';
  error = signal<string | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: (data) => {
        this.types.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error || 'Erreur de chargement');
        this.types.set([]);
        this.loading.set(false);
      }
    });
  }

  addType(): void {
    const name = this.newType.trim();
    if (!name) return;
    this.error.set(null);
    this.service.create(name).subscribe({
      next: (created) => {
        this.types.update(list => [created, ...list]);
        this.newType = '';
      },
      error: (err) => this.error.set(err?.error || 'Échec de la création')
    });
  }

  updateType(vuln: VulnerabilityType): void {
    const name = (vuln.name || '').trim();
    if (!name) return;
    this.error.set(null);
    this.service.update(vuln.type_id, name).subscribe({
      next: (updated) => {
        this.types.update(list => list.map(v => v.type_id === updated.type_id ? updated : v));
      },
      error: (err) => this.error.set(err?.error || 'Échec de la mise à jour')
    });
  }

  deleteType(id: number): void {
    if (!confirm('Supprimer ce type ?')) return;
    this.error.set(null);
    this.service.delete(id).subscribe({
      next: () => this.types.update(list => list.filter(v => v.type_id !== id)),
      error: (err) => this.error.set(err?.error || 'Échec de la suppression')
    });
  }
}
