// time-left.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeLeft', standalone: true, pure: true })
export class TimeLeftPipe implements PipeTransform {
  transform(endIso: string): string {
    const now = Date.now();
    const end = new Date(endIso).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Terminé';

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
