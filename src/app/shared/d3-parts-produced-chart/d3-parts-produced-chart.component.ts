import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import * as d3 from 'd3';
import { PartsProducedPoint } from 'src/app/models/parts-produced-point.model';


@Component({
  selector: 'app-d3-parts-produced-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './d3-parts-produced-chart.component.html',
  styleUrls: ['./d3-parts-produced-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3PartsProducedChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input()
  data: PartsProducedPoint[] = [];

  @ViewChild('chartContainer', {
    static: true,
  })
  chartContainer!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;

  private readonly chartHeight = 320;

  private readonly margin = {
    top: 20,
    right: 24,
    bottom: 48,
    left: 64,
  };

  ngAfterViewInit(): void {
    this.renderChart();

    this.resizeObserver = new ResizeObserver(() => {
      this.renderChart();
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (!this.chartContainer) {
      return;
    }

    const container = this.chartContainer.nativeElement;

    const width = container.clientWidth;

    if (width <= 0) {
      return;
    }

    d3.select(container).selectAll('svg').remove();

    if (!this.data?.length) {
      return;
    }

    const innerWidth = Math.max(
      width - this.margin.left - this.margin.right,
      0,
    );

    const innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', this.chartHeight)
      .attr('viewBox', `0 0 ${width} ${this.chartHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const chartGroup = svg.append('g').attr(
      'transform',
      `translate(
          ${this.margin.left},
          ${this.margin.top}
        )`,
    );

    const sortedData = [...this.data].sort((a, b) => a.timestamp - b.timestamp);

    /*
     * X axis
     */

    const xScale = d3
      .scalePoint<number>()
      .domain(sortedData.map((_, index) => index))
      .range([0, innerWidth]);

    /*
     * Y axis
     */

    const yMax = d3.max(sortedData, (d) => d.partsProduced) ?? 0;

    const yMin = d3.min(sortedData, (d) => d.partsProduced) ?? 0;

    const range = Math.max(yMax - yMin, 1);

    const yPadding = Math.max(range * 0.1, 1);

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .nice()
      .range([innerHeight, 0]);

    /*
     * X axis
     */

    const xTickIndices =
      sortedData.length <= 5
        ? sortedData.map((_, index) => index)
        : Array.from(
            { length: 5 },
            (_, index) =>
              Math.round((index * (sortedData.length - 1)) / 4),
          );

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xTickIndices)
      .tickFormat((index) =>
        d3.timeFormat('%H:%M:%S')(new Date(sortedData[index].timestamp)),
      );

    chartGroup
      .append('g')
      .attr(
        'class',
        'd3-parts-produced-chart__axis d3-parts-produced-chart__axis--x',
      )
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    /*
     * Y axis
     */

    const yAxis = d3.axisLeft(yScale).ticks(6);

    chartGroup
      .append('g')
      .attr(
        'class',
        'd3-parts-produced-chart__axis d3-parts-produced-chart__axis--y',
      )
      .call(yAxis);

    /*
     * Horizontal grid
     */

    chartGroup
      .append('g')
      .attr('class', 'd3-parts-produced-chart__grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      );

    /*
     * Line
     */

    const line = d3
      .line<PartsProducedPoint>()
      .x((_, index) => xScale(index) ?? 0)
      .y((d) => yScale(d.partsProduced))
      .curve(d3.curveMonotoneX);

    chartGroup
      .append('path')
      .datum(sortedData)
      .attr('class', 'd3-parts-produced-chart__line')
      .attr('d', line);

    /*
     * Data points
     */

    chartGroup
      .selectAll('.d3-parts-produced-chart__point')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'd3-parts-produced-chart__point')
      .attr('cx', (_, index) => xScale(index) ?? 0)
      .attr('cy', (d) => yScale(d.partsProduced))
      .attr('r', 3.5);

    /*
     * Y axis label
     */

    chartGroup
      .append('text')
      .attr('class', 'd3-parts-produced-chart__axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -48)
      .attr('text-anchor', 'middle')
      .text('Parts produced');

    /*
     * X axis label
     */

    chartGroup
      .append('text')
      .attr('class', 'd3-parts-produced-chart__axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 42)
      .attr('text-anchor', 'middle')
      .text('Time');
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();

    if (this.chartContainer) {
      d3.select(this.chartContainer.nativeElement).selectAll('svg').remove();
    }
  }
}
