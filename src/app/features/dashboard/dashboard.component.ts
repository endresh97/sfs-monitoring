import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeviceMonitoringService } from 'src/app/services/device-monitoring.service';
import { D3LineChartComponent } from 'src/app/shared/d3-line-chart/d3-line-chart.component';
import { D3PartsProducedChartComponent } from 'src/app/shared/d3-parts-produced-chart/d3-parts-produced-chart.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiErrorService } from 'src/app/services/api-error.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import {
  LocalizedDatePipe,
  LocalizedNumberPipe,
} from 'src/app/shared/localized-format.pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    D3LineChartComponent,
    D3PartsProducedChartComponent,
    MatProgressBarModule,
    TranslateModule,
    LocalizedDatePipe,
    LocalizedNumberPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  apiError: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly deviceMonitoringService: DeviceMonitoringService,
    private readonly apiErrorService: ApiErrorService,
    public readonly languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.deviceMonitoringService.loadDevices();
    this.apiErrorService.error$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (message) => {
        this.apiError = message;
      },
    });
  }

  onDeviceSelected(deviceId: string): void {
    this.deviceMonitoringService.selectDevice(deviceId);
  }

  onLanguageSelected(language: string): void {
    this.languageService.setLanguage(language);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
