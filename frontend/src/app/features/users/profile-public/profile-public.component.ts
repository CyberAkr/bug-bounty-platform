import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@app/features/users/user.service';
import { UserPublic } from '@app/models/user.model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-profile-public',
  standalone: true,
  templateUrl: './profile-public.component.html',
  imports: [
    NgIf
  ]
})
export class ProfilePublicComponent implements OnInit {
  user = signal<UserPublic | null>(null);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getPublic(+id).subscribe({
        next: this.user.set,
        error: err => console.error('❌ Erreur API', err)
      });
    }
  }
}
