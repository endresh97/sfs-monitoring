import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Device } from '../models/device.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
  ) {}

  getDevices(): Observable<Device[]> {
    const endpoints = this.configService.getEndpoints();
    if (!endpoints) {
      throw new Error('Application configuration is not loaded.');
    }

    const url = `${environment.apiBaseUrl}${endpoints.devices}`;

    if (!endpoints) {
      throw new Error('Application configuration is not loaded.');
    }

    return this.http.get<Device[]>(url);
  }
}
