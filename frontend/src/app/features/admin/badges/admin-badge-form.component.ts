import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {BadgesAdminService} from './badges-admin.service';

// Material
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-admin-badge-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatIconModule
  ],
  template: `
    <mat-card class="p-4 max-w-3xl mx-auto">
      <button mat-button color="primary" (click)="back()">
        <mat-icon>arrow_back</mat-icon>
        Retour
      </button>

      <h2 class="text-xl font-semibold mb-4">
        {{ isEdit() ? 'Modifier un badge' : 'Créer un badge' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="name" required/>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>

        <div>
          <div class="flex items-center gap-3 mb-2">
            <button mat-stroked-button type="button" (click)="pickFile.click()">
              <mat-icon>upload</mat-icon>
              Importer une image
            </button>
            <span class="text-sm text-gray-500">PNG/JPG/WEBP – max 10 Mo</span>
          </div>
          <input #pickFile hidden type="file" accept="image/*" (change)="onFile($event)"/>
          <div *ngIf="preview()" class="mt-2">
            <img [src]="preview()" alt="preview" class="h-24 w-24 object-cover rounded border"/>
          </div>
          <p *ngIf="form.value.imagePath && !preview()" class="mt-2">
            Image actuelle: <a [href]="form.value.imagePath" target="_blank">{{ form.value.imagePath }}</a>
          </p>
        </div>

        <div class="flex gap-2">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            {{ isEdit() ? 'Enregistrer' : 'Créer' }}
          </button>
          <button mat-stroked-button type="button" (click)="back()">Annuler</button>
        </div>
      </form>
    </mat-card>
  `,
})
export class AdminBadgeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(BadgesAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly isEdit = signal(false);
  readonly preview = signal<string | null>(null);
  private currentId: number | null = null;
  private stagedFile: File | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    imagePath: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!id);
    if (id) {
      this.currentId = +id;
      const exist = this.svc.items().find(b => b.badgeId === this.currentId);
      if (exist) {
        this.form.patchValue({
          name: exist.name,
          description: exist.description ?? '',
          imagePath: exist.imagePath ?? ''
        });
      } else {
        this.svc.list();
        setTimeout(() => {
          const after = this.svc.items().find(b => b.badgeId === this.currentId!);
          if (after) {
            this.form.patchValue({
              name: after.name,
              description: after.description ?? '',
              imagePath: after.imagePath ?? ''
            });
          }
        }, 300);
      }
    }
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.stagedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.preview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const commit = (imagePath?: string) => {
      if (imagePath) this.form.patchValue({imagePath});
      const payload = this.form.value as any;

      const req$ = this.isEdit()
        ? this.svc.update(this.currentId!, payload)  // Observable<number>
        : this.svc.create(payload);                  // Observable<number>

      req$.subscribe({
        next: () => {
          this.snack.open(this.isEdit() ? 'Badge mis à jour' : 'Badge créé', 'OK', {duration: 1500});
          this.svc.list();
          this.back();
        },
        error: () => {
          this.snack.open('Erreur lors de l’enregistrement', 'OK', {duration: 2500});
          this.saving.set(false);
        }
      });
    };

    // si un fichier est choisi, on l’upload d’abord pour récupérer imagePath
    if (this.stagedFile) {
      this.svc.uploadImage(this.stagedFile).subscribe({
        next: ({imagePath}) => commit(imagePath),
        error: () => {
          this.snack.open('Upload image échoué', 'OK', {duration: 2500});
          this.saving.set(false);
        }
      });
    } else {
      commit();
    }
  }

  back() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
