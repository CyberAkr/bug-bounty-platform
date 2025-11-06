// challenge-status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'challengeStatus', standalone: true, pure: true })
export class ChallengeStatusPipe implements PipeTransform {
  transform(startIso: string, endIso: string): 'A venir' | 'En cours' | 'Terminé' {
    const now = new Date().getTime();
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (now < start) return 'A venir';
    if (now >= start && now < end) return 'En cours';
    return 'Terminé';
  }
}
