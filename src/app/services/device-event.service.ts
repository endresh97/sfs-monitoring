import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DeviceEvent } from '../models/device.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceEventService {
  private readonly eventSubject = new Subject<DeviceEvent>();
  readonly event$: Observable<DeviceEvent> = this.eventSubject.asObservable();
  private eventSource?: EventSource;

  constructor(
    private readonly configService: ConfigService,
    private readonly ngZone: NgZone,
  ) {}

  connect(deviceId: string): void {
    this.disconnect();
    const endpoints = this.configService.getEndpoints();

    if (!endpoints) {
      throw new Error('Application configuration is not loaded.');
    }

    const endpoint = endpoints.events.replace(
      '{deviceId}',
      encodeURIComponent(deviceId),
    );

    const url = `${environment.apiBaseUrl}${endpoint}`;

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        const deviceEvent = JSON.parse(event.data) as DeviceEvent;
        this.eventSubject.next(deviceEvent);
      });
    };

    this.eventSource.onerror = (error: Event) => {
      console.error('SSE connection error.', error);
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
  }
}
