import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppConfig, AppEndpoints } from '../models/app-config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly configEndpoint =
    'https://mock-api.assessment.sfsdm.org/config';
  private readonly configSubject = new BehaviorSubject<AppConfig | null>(null);

  config$: Observable<AppConfig | null> = this.configSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(this.configEndpoint).pipe(
      tap((config) => {
        this.configSubject.next(config);
      }),
    );
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  getEndpoints(): AppEndpoints | null {
    return this.configSubject.value?.endpoints ?? null;
  }
}
