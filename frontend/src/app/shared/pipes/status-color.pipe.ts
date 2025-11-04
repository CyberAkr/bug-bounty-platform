import { Pipe, PipeTransform } from '@angular/core';

// Accepte tous les statuts possibles + fallback string
export type ProgramStatus = 'PENDING' | 'APPROVED' | 'PAUSED' | 'CLOSED' | string;

@Pipe({
  name: 'statusColor',
  standalone: true,
})
export class StatusColorPipe implements PipeTransform {

  transform(status: ProgramStatus): string {
    // Normalise en uppercase pour éviter les écarts
    const key = (status || '').toString().toUpperCase();

    // Tailwind classes (ou tes classes utilitaires)
    const map: Record<string, string> = {
      'PENDING':  'bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded',
      'APPROVED': 'bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded',
      'PAUSED':   'bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded',
      'CLOSED':   'bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded',
    };

    return map[key] ?? 'bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded';
  }
}
