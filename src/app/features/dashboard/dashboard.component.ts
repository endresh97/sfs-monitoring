import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeviceMonitoringService } from 'src/app/services/device-monitoring.service';
import { D3LineChartComponent } from 'src/app/shared/d3-line-chart/d3-line-chart.component';
import { D3PartsProducedChartComponent } from 'src/app/shared/d3-parts-produced-chart/d3-parts-produced-chart.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    D3LineChartComponent,
    D3PartsProducedChartComponent,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    public readonly deviceMonitoringService: DeviceMonitoringService,
  ) {}

  ngOnInit(): void {
    this.deviceMonitoringService.loadDevices();
  }

  onDeviceSelected(deviceId: string): void {
    this.deviceMonitoringService.selectDevice(deviceId);
  }
}
