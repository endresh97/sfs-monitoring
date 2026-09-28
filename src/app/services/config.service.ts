import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  timer,
  switchMap,
  takeUntil,
  catchError,
  EMPTY,
  Observable,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../models/app-config.model';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class ConfigService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly configSubject = new BehaviorSubject<AppConfig | null>(null);
  readonly config$ = this.configSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    return this.http
      .get<AppConfig>(`${API_BASE_URL}${API_ENDPOINTS.config}`)
      .pipe(
        tap({
          next: (config) => {
            this.configSubject.next(config);
            this.startConfigRefresh();
          },
          error: (error) => {
            console.error('Unable to load application configuration.', error);
          },
        }),
      );
  }

  startConfigRefresh(): void {
    timer(5 * 60 * 1000, 5 * 60 * 1000)
      .pipe(
        switchMap(() =>
          this.http.get<AppConfig>(`${API_BASE_URL}${API_ENDPOINTS.config}`),
        ),
        catchError((error) => {
          console.error('Unable to refresh application configuration.', error);
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (config) => {
          this.configSubject.next(config);
        },
      });
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  getEndpoints() {
    return this.configSubject.value?.endpoints;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
