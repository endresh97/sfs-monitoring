import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppConfig } from './models/app-config.model';
import { Device, DeviceEvent } from './models/device.model';
import { ConfigService } from './services/config.service';
import { DeviceApiService } from './services/device-api.service';
import { DeviceEventService } from './services/device-event.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    private deviceApiService: DeviceApiService,
    private deviceEventService: DeviceEventService,
  ) {}

  ngOnInit(): void {
    // testing all the APIs
    this.configService.loadConfig().subscribe((config: AppConfig) => {
      console.log('config :: ', config);

      this.deviceApiService.getDevices().subscribe((devices: Device[]) => {
        console.log('devices :: ', devices);

        this.deviceEventService.connect('8027');
        this.deviceEventService.event$.subscribe((eventData: DeviceEvent | null) => {
            console.log('Device eventData in component :: ', eventData);
          },
        );
      });
    });
  }
}
