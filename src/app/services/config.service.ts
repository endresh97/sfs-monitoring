import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConfig, AppEndpoints } from '../models/app-config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly configEndpoint = '/config';
  private readonly configSubject = new BehaviorSubject<AppConfig | null>(null);

  config$: Observable<AppConfig | null> = this.configSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    const url = `${environment.apiBaseUrl}${this.configEndpoint}`;

    return this.http.get<AppConfig>(url).pipe(
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
