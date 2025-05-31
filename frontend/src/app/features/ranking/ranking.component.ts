import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService } from './ranking.service';
import { UserRanking } from '@app/models/user.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ranking.component.html',
})
export class RankingComponent implements OnInit {
  readonly users = signal<UserRanking[]>([]);
  private rankingService = inject(RankingService);

  ngOnInit(): void {
    this.rankingService.getTopResearchers().subscribe(this.users.set);
  }
}
