// src/app/shared/pipes/truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 15, ellipsis = '…'): string {
    if (!value) return '';
    const v = String(value);
    return v.length > limit ? v.substring(0, limit) + ellipsis : v;
  }
}
