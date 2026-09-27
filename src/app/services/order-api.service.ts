import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../models/order.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
  ) {}

  getOrder(orderId: string): Observable<Order> {
    const endpoints = this.configService.getEndpoints();

    if (!endpoints) {
      throw new Error('Application configuration is not loaded.');
    }

    const endpoint = endpoints.order.replace(
      '{orderId}',
      encodeURIComponent(orderId),
    );

    const url = `${environment.apiBaseUrl}${endpoint}`;
    return this.http.get<Order>(url);
  }
}
