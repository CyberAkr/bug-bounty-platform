import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BadgesAdminService } from './badges-admin.service';

@Component({
  selector: 'app-admin-badge-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatIconModule
  ],
  templateUrl: './admin-badge-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminBadgeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(BadgesAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private t = inject(TranslateService);

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

      // Cherche le badge en mémoire (si liste déjà chargée)
      const exist = this.svc.items().find(b => b.badgeId === this.currentId);
      if (exist) {
        this.form.patchValue({
          name: exist.name,
          description: exist.description ?? '',
          imagePath: exist.imagePath ?? ''
        });
      } else {
        // Recharge la liste puis tente de patcher
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
      if (imagePath) this.form.patchValue({ imagePath });
      const payload = this.form.value as any;

      const req$ = this.isEdit()
        ? this.svc.update(this.currentId!, payload)  // Observable<number>
        : this.svc.create(payload);                  // Observable<number>

      req$.subscribe({
        next: () => {
          this.snack.open(
            this.isEdit() ? this.t.instant('admin.badges.msg.updated') : this.t.instant('admin.badges.msg.created'),
            this.t.instant('common.ok'),
            { duration: 1500 }
          );
          this.svc.list();
          this.back();
        },
        error: () => {
          this.snack.open(this.t.instant('admin.badges.msg.saveError'), this.t.instant('common.ok'), { duration: 2500 });
          this.saving.set(false);
        }
      });
    };

    // Si un fichier est choisi, on l’upload d’abord pour obtenir imagePath
    if (this.stagedFile) {
      this.svc.uploadImage(this.stagedFile).subscribe({
        next: ({ imagePath }) => commit(imagePath),
        error: () => {
          this.snack.open(this.t.instant('admin.badges.msg.uploadError'), this.t.instant('common.ok'), { duration: 2500 });
          this.saving.set(false);
        }
      });
    } else {
      commit();
    }
  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
