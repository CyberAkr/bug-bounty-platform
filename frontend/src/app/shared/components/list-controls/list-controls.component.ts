import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

type SortOption = { value: string; label: string };

@Component({
  selector: 'app-list-controls',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatPaginatorModule, MatButtonModule
  ],
  templateUrl: './list-controls.component.html'
})
export class ListControlsComponent {
  // -------- Inputs -> signals --------
  @Input() set total(v: number)     { this.totalSig.set(v ?? 0); }
  @Input() set pageIndex(v: number) { this.pageIndexSig.set(v ?? 0); }
  @Input() set pageSize(v: number)  { this.pageSizeSig.set(v ?? 10); }
  @Input() set query(v: string)     { this.querySig.set(v ?? ''); }

  /** Accepte string OU objet {value} par mégarde → convertit en string */
  @Input() set sort(v: any) {
    this.sortSig.set(this.coerceSort(v));
  }

  @Input() set pageSizeOptions(v: number[]) {
    this.pageSizeOptionsSig.set(v?.length ? v : [10, 25, 50]);
  }
  @Input() set sortOptionsInput(v: SortOption[]) {
    this.sortOptionsSig.set(v?.length ? v : this.defaultSort);
    // si la valeur courante n'existe pas dans les options, on la vide
    const cur = this.sortSig();
    if (cur && !this.sortOptionsSig().some(o => o.value === cur)) {
      this.sortSig.set('');
    }
  }

  // -------- Outputs --------
  @Output() change = new EventEmitter<{ pageIndex: number; pageSize: number; query: string; sort: string }>();

  // -------- State --------
  totalSig        = signal(0);
  pageIndexSig    = signal(0);
  pageSizeSig     = signal(10);
  querySig        = signal('');
  sortSig         = signal(''); // string only

  pageSizeOptionsSig = signal<number[]>([10, 25, 50]);
  sortOptionsSig     = signal<SortOption[]>([
    { value: 'createdDesc', label: 'list.sort.createdDesc' },
    { value: 'createdAsc',  label: 'list.sort.createdAsc'  },
    { value: 'titleAsc',    label: 'list.sort.titleAsc'    },
    { value: 'titleDesc',   label: 'list.sort.titleDesc'   }
  ]);

  private searchTimer: any;

  // -------- Handlers --------
  onSearch(value: string) {
    this.querySig.set(value ?? '');
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.pageIndexSig.set(0);
      this.emitChange();
    }, 250);
  }

  onSort(value: any) {
    const v = this.coerceSort(value);
    this.sortSig.set(v);
    this.pageIndexSig.set(0);
    this.emitChange();
  }

  onPageSize(value: number) {
    this.pageSizeSig.set(+value || 10);
    this.pageIndexSig.set(0);
    this.emitChange();
  }

  onPage(e: PageEvent) {
    this.pageIndexSig.set(e.pageIndex);
    this.pageSizeSig.set(e.pageSize);
    this.emitChange();
  }

  // -------- Utils d’affichage --------
  /** Renvoie le label i18n pour une valeur; '' si invalide → rien n'est affiché */
  labelFor(value: string): string {
    const found = this.sortOptionsSig().find(opt => opt.value === value);
    return found ? found.label : '';
  }

  /** Force le tri en string (gère objets {value}, null, undefined, etc.) */
  private coerceSort(input: any): string {
    if (typeof input === 'string') return input;
    if (input && typeof input === 'object' && 'value' in input) {
      return String((input as any).value ?? '');
    }
    return '';
  }

  private emitChange() {
    this.change.emit({
      pageIndex: this.pageIndexSig(),
      pageSize:  this.pageSizeSig(),
      query:     this.querySig().trim(),
      sort:      this.sortSig()
    });
  }

  private readonly defaultSort: SortOption[] = [
    { value: 'createdDesc', label: 'list.sort.createdDesc' },
    { value: 'createdAsc',  label: 'list.sort.createdAsc'  },
    { value: 'titleAsc',    label: 'list.sort.titleAsc'    },
    { value: 'titleDesc',   label: 'list.sort.titleDesc'   }
  ];
}
