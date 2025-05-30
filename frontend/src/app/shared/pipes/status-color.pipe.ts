import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'statusColor' })
export class StatusColorPipe implements PipeTransform {
  transform(status: 'APPROVED' | 'PENDING'): string {
    return status === 'APPROVED' ? 'text-green-600' : 'text-yellow-500';
  }
}
