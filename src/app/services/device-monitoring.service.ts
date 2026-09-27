import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Device, DeviceEvent } from '../models/device.model';
import { Order } from '../models/order.model';
import { DeviceApiService } from './device-api.service';
import { DeviceEventService } from './device-event.service';
import { OrderApiService } from './order-api.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceMonitoringService implements OnDestroy {
  devices: Device[] = [];
  selectedDeviceId: string | null = null;
  currentEvent: DeviceEvent | null = null;
  currentOrder: Order | null = null;
  loadingDevices = false;
  loadingOrder = false;
  error = '';
  private destroy$ = new Subject<void>();
  private currentOrderId: string | null = null;

  constructor(
    private readonly deviceApi: DeviceApiService,
    private readonly eventService: DeviceEventService,
    private readonly orderApi: OrderApiService,
  ) {
    this.subscribeToEvents();
  }

  loadDevices(): void {
    this.loadingDevices = true;
    this.error = '';

    this.deviceApi
      .getDevices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (devices) => {
          this.devices = devices;
          this.loadingDevices = false;
        },
        error: () => {
          this.loadingDevices = false;
          this.error = 'Unable to load devices.';
        },
      });
  }

  selectDevice(deviceId: string): void {
    this.currentOrderId = null;
    this.selectedDeviceId = deviceId;
    this.currentEvent = null;
    this.currentOrder = null;
    this.error = '';
    this.eventService.connect(deviceId);
  }

  private subscribeToEvents(): void {
    this.eventService.event$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (event) => {
        if (!event) {
          return;
        }
        this.handleDeviceEvent(event);
      },
      error: () => {
        this.error = 'Device event connection failed.';
      },
    });
  }

  private handleDeviceEvent(event: DeviceEvent): void {
    this.currentEvent = event;
    if (!event.order) {
      return;
    }

    if (this.currentOrderId === event.order) {
      return;
    }

    this.currentOrderId = event.order;
    this.loadOrder(event.order);
  }

  private loadOrder(orderId: string): void {
    this.loadingOrder = true;
    this.orderApi
      .getOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.currentOrder = order;
          this.loadingOrder = false;
        },
        error: () => {
          this.loadingOrder = false;
          this.error = 'Unable to load order.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.eventService.disconnect();
  }
}
