import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3PartsProducedChartComponent } from './d3-parts-produced-chart.component';

describe('D3PartsProducedChartComponent', () => {
  let component: D3PartsProducedChartComponent;
  let fixture: ComponentFixture<D3PartsProducedChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [D3PartsProducedChartComponent]
    });
    fixture = TestBed.createComponent(D3PartsProducedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
