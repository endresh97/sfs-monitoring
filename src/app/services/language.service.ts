import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

const LANGUAGE_STORAGE_KEY = 'sfs-monitoring.language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  availableLanguages: string[] = ['en'];
  private readonly currentLanguageSubject = new BehaviorSubject('en');
  readonly currentLanguage$ = this.currentLanguageSubject.asObservable();

  get currentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  constructor(
    private readonly translate: TranslateService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  initialize(languages: readonly string[]): Observable<string> {
    this.availableLanguages = Array.from(
      new Set(
        languages
          .map((language) => language.toLowerCase())
          .filter((language) => language === 'en' || language === 'de'),
      ),
    );

    if (!this.availableLanguages.includes('en')) {
      this.availableLanguages.push('en');
    }

    const initialLanguage = this.resolveInitialLanguage();
    this.translate.setDefaultLang('en');

    return this.translate.getTranslation('en').pipe(
      switchMap(() => this.loadLanguage(initialLanguage)),
      tap((language: string) => this.setCurrentLanguage(language)),
    );
  }

  setLanguage(language: string): void {
    if (
      !this.availableLanguages.includes(language) ||
      language === this.currentLanguage
    ) {
      return;
    }

    this.loadLanguage(language)
      .pipe(tap((loadedLanguage) => this.setCurrentLanguage(loadedLanguage)))
      .subscribe({
        error: (error) =>
          console.error('Unable to load the selected language.', error),
      });
  }

  private loadLanguage(language: string): Observable<string> {
    return this.translate.use(language).pipe(
      map(() => language),
      catchError((error) => {
        if (language === 'en') {
          return throwError(() => error);
        }

        console.error(
          `Unable to load ${language}; falling back to English.`,
          error,
        );
        return this.translate.use('en').pipe(map(() => 'en'));
      }),
    );
  }

  private resolveInitialLanguage(): string {
    const savedLanguage = this.readSavedLanguage();
    if (savedLanguage && this.availableLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }

    const browserLanguage =
      typeof navigator === 'undefined'
        ? ''
        : navigator.language.split('-')[0].toLowerCase();

    return this.availableLanguages.includes(browserLanguage)
      ? browserLanguage
      : 'en';
  }

  private readSavedLanguage(): string | null {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY)?.toLowerCase() ?? null;
    } catch {
      return null;
    }
  }

  private setCurrentLanguage(language: string): void {
    this.currentLanguageSubject.next(language);
    this.document.documentElement.lang = language;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {}
  }
}