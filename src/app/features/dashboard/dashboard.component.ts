import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeviceMonitoringService } from 'src/app/services/device-monitoring.service';

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
