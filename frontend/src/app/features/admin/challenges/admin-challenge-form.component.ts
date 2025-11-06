import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { ChallengesAdminService, ChallengeAdminDTO, Program } from './challenges-admin.service';

@Component({
  selector: 'app-admin-challenge-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatSnackBarModule, MatCardModule
  ],
  templateUrl: './admin-challenge-form.component.html'
})
export class AdminChallengeFormComponent implements OnInit {
  private svc = inject(ChallengesAdminService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  id = signal<number | null>(null);

  // modèle
  title = signal('');
  description = signal('');
  theme = signal('');
  linkToResource = signal('');
  programId = signal<number | null>(null);
  badgeId = signal<number | null>(null);
  winningCode = signal(''); // requis en création

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  programs = signal<Program[]>([]);
  loading = signal(false);

  ngOnInit() {
    // charge les programmes
    this.svc.listPrograms().subscribe({
      next: (p) => this.programs.set(p ?? []),
      error: () => this.snack.open('Erreur chargement programmes', 'OK', { duration: 2500 })
    });

    // mode edit ?
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id.set(+idParam);
      // Si tu veux pré-remplir le formulaire, ajoute un endpoint GET /api/admin/challenges/:id
      // et fais un set() des signals ici.
    }
  }

  save() {
    const start = this.startDate();
    const end = this.endDate();

    if (!this.title() || !start || !end || !this.programId()) {
      this.snack.open('Titre, période et programme sont requis.', 'OK', { duration: 2500 });
      return;
    }
    if (!this.isEdit() && !this.winningCode()) {
      this.snack.open('Le code gagnant est requis à la création.', 'OK', { duration: 2500 });
      return;
    }

    const dto: ChallengeAdminDTO = {
      title: this.title(),
      description: this.description(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      theme: this.theme() || null,
      linkToResource: this.linkToResource() || null,
      programId: this.programId()!,
      badgeId: this.badgeId() || null,
      winningCode: this.isEdit() ? (this.winningCode() || null) : this.winningCode()
    };

    this.loading.set(true);
    const req$ = this.isEdit()
      ? this.svc.update(this.id()!, dto)
      : this.svc.create(dto);

    req$.subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open(this.isEdit() ? 'Défi mis à jour' : 'Défi créé', 'OK', { duration: 2000 });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err?.error || 'Erreur lors de l’enregistrement', 'OK', { duration: 3200 });
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
