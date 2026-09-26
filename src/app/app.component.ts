import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppConfig } from './models/app-config.model';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.loadConfig().subscribe((data: AppConfig) => {
      console.log('data :: ', data);
    });
  }
}
