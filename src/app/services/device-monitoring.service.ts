import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Device, DeviceEvent } from '../models/device.model';
import { Order } from '../models/order.model';
import { DeviceApiService } from './device-api.service';
import { DeviceEventService } from './device-event.service';
import { OrderApiService } from './order-api.service';
import { ProductionPoint } from '../models/production-point.model';
import { PartsProducedPoint } from '../models/parts-produced-point.model';
import { ProductionInterrupt } from '../models/production-interrupt.model';

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
  private orderRequestId = 0;
  private deviceSelectionVersion = 0;
  partsPerMinuteHistory: ProductionPoint[] = [];
  partsProducedHistory: PartsProducedPoint[] = [];
  productionInterrupts: ProductionInterrupt[] = [];

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
    this.deviceSelectionVersion += 1;
    this.orderRequestId += 1;
    this.currentOrderId = null;
    this.selectedDeviceId = deviceId;
    this.currentEvent = null;
    this.currentOrder = null;
    this.error = '';
    this.partsPerMinuteHistory = [];
    this.partsProducedHistory = [];
    this.productionInterrupts = [];
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

    console.log('event: : ', event)

    const orderChanged = this.currentOrderId !== event.order;
    if (orderChanged) {
      this.currentOrderId = event.order;
      this.currentOrder = null;
    }

    this.partsPerMinuteHistory = [
      ...this.partsPerMinuteHistory,
      {
        timestamp: event.timestamp,
        partsPerMinute: event.partsPerMinute,
      },
    ].slice(-5);

    if (event.status === 'stopped' || event.status === 'maintenance') {
      this.productionInterrupts = [
        {
          timestamp: event.timestamp,
          status: event.status,
        },
        ...this.productionInterrupts,
      ].slice(0, 5);
    }

    this.loadOrder(event.order, event.timestamp, orderChanged);
  }

  private loadOrder(
    orderId: string,
    timestamp: number,
    showLoading: boolean,
  ): void {
    if (showLoading) {
      this.loadingOrder = true;
    }
    const requestId = ++this.orderRequestId;
    const selectionVersion = this.deviceSelectionVersion;

    this.orderApi
      .getOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          if (
            selectionVersion !== this.deviceSelectionVersion ||
            this.currentOrderId !== orderId
          ) {
            return;
          }

          if (this.error === 'Unable to load order.') {
            this.error = '';
          }

          this.partsProducedHistory = [
            ...this.partsProducedHistory,
            {
              timestamp,
              partsProduced: order.productionState,
            },
          ]
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-5);

          if (requestId === this.orderRequestId) {
            this.currentOrder = order;
            this.loadingOrder = false;
          }
        },
        error: () => {
          if (
            selectionVersion === this.deviceSelectionVersion &&
            requestId === this.orderRequestId
          ) {
            this.loadingOrder = false;
            this.error = 'Unable to load order.';
          }
        },
      });
  }

  get orderProgressPercentage(): number {
    if (!this.currentOrder) {
      return 0;
    }

    const { productionTarget, productionState } = this.currentOrder;
    if (
      !Number.isFinite(productionTarget) ||
      !Number.isFinite(productionState) ||
      productionTarget <= 0 ||
      productionState < 0
    ) {
      return 0;
    }
    return Math.max(
      0,
      Math.min((productionState / productionTarget) * 100, 100),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.eventService.disconnect();
  }
}
