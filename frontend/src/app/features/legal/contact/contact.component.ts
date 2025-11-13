import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-contact',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslateModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {}
