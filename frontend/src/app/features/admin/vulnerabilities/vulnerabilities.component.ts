import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VulnerabilitiesService,
  VulnerabilityType
} from './vulnerabilities.service';

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vulnerabilities.component.html',
})
export class VulnerabilitiesComponent {
  private service = inject(VulnerabilitiesService);

  types = signal<VulnerabilityType[]>([]);
  newType = signal('');

  constructor() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(data => this.types.set(data));
  }

  addType() {
    const name = this.newType().trim();
    if (!name) return;

    this.service.create(name).subscribe(() => {
      this.newType.set('');
      this.load();
    });
  }

  updateType(vuln: VulnerabilityType) {
    this.service.update(vuln.typeId, vuln.name).subscribe(() => this.load());
  }

  deleteType(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
