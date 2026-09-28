import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'localizedNumber',
  standalone: true,
  pure: false,
})
export class LocalizedNumberPipe implements PipeTransform {
  private readonly formatters = new Map<string, Intl.NumberFormat>();

  constructor(private readonly languageService: LanguageService) {}

  transform(
    value: number | null | undefined,
    minimumFractionDigits = 0,
    maximumFractionDigits = 3,
  ): string {
    if (value == null || !Number.isFinite(value)) {
      return '';
    }

    const language = this.languageService.currentLanguage;
    const key = `${language}:${minimumFractionDigits}:${maximumFractionDigits}`;
    let formatter = this.formatters.get(key);

    if (!formatter) {
      formatter = new Intl.NumberFormat(language, {
        minimumFractionDigits,
        maximumFractionDigits,
      });
      this.formatters.set(key, formatter);
    }

    return formatter.format(value);
  }
}

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false,
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly formatters = new Map<string, Intl.DateTimeFormat>();

  constructor(private readonly languageService: LanguageService) {}

  transform(value: Date | number | string | null | undefined): string {
    if (value == null) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const language = this.languageService.currentLanguage;
    let formatter = this.formatters.get(language);

    if (!formatter) {
      formatter = new Intl.DateTimeFormat(language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      this.formatters.set(language, formatter);
    }

    return formatter.format(date);
  }
}

