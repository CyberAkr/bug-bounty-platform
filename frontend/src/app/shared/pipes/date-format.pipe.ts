import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
  pure: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    opts?: (Intl.DateTimeFormatOptions & { withTime?: boolean; locale?: string })
  ): string {
    if (value === null || value === undefined || value === '') return '—';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '—';

    const locale =
      opts?.locale ||
      (typeof navigator !== 'undefined' ? navigator.language : 'fr-BE');

    const withTime = opts?.withTime ?? true;

    const base: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const finalOpts: Intl.DateTimeFormatOptions = withTime
      ? { ...base, hour: '2-digit', minute: '2-digit' }
      : base;

    // Merge sans les clés custom
    const { withTime: _ignore1, locale: _ignore2, ...rest } = opts || {};
    Object.assign(finalOpts, rest);

    try {
      return new Intl.DateTimeFormat(locale, finalOpts).format(date);
    } catch {
      return date.toLocaleString();
    }
  }
}
