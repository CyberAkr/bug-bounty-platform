import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Program, ProgramStatus, ProgramUpdate } from '../programs.service';
import {TruncatePipe} from '@app/shared/pipes/truncate.pipe';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'tr[app-program-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe, TranslatePipe],
  host: { class: 'border-b last:border-0 hover:bg-gray-50' },
  templateUrl: './program-row.component.html',
})
export class ProgramRowComponent {
  @Input() program!: Program;
  @Output() approve = new EventEmitter<{ id: number }>();
  @Output() update = new EventEmitter<{ id: number; dto: ProgramUpdate }>();
  @Output() removed = new EventEmitter<number>();

  edit = false;
  title = '';
  description = '';
  status: ProgramStatus = 'PENDING';
  readonly maxDesc = 15; // longueur d’aperçu

  ngOnInit() {
    this.resetLocal();
  }

  toggleEdit() {
    this.edit = !this.edit;
    if (this.edit) this.resetLocal();
  }

  save() {
    const dto: ProgramUpdate = {};
    if (this.title !== this.program.title) dto.title = this.title;
    if (this.description !== this.program.description) dto.description = this.description;
    if (this.status !== this.program.status) dto.status = this.status;

    if (Object.keys(dto).length === 0) {
      this.edit = false;
      return;
    }
    this.update.emit({ id: this.program.program_id, dto });
    this.edit = false;
  }

  private resetLocal() {
    this.title = this.program.title;
    this.description = this.program.description;
    this.status = this.program.status;
  }
}
