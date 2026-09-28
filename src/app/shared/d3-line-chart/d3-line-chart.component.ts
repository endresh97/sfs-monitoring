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
import { PartsPerMinutePoint } from 'src/app/models/parts-produced-point.model';


@Component({
  selector: 'app-d3-line-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './d3-line-chart.component.html',
  styleUrls: ['./d3-line-chart.component.scss']
})
export class D3LineChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input()
  data: PartsPerMinutePoint[] = [];

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
    left: 56,
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

    const xDomain = d3.extent(sortedData, (d) => new Date(d.timestamp)) as [
      Date,
      Date,
    ];

    /*
     * When there is only one point, D3 would otherwise
     * create an identical start/end domain.
     */
    if (xDomain[0].getTime() === xDomain[1].getTime()) {
      xDomain[0] = new Date(xDomain[0].getTime() - 30000);

      xDomain[1] = new Date(xDomain[1].getTime() + 30000);
    }

    const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    const yMax = d3.max(sortedData, (d) => d.partsPerMinute) ?? 0;

    const yMin = d3.min(sortedData, (d) => d.partsPerMinute) ?? 0;

    const yPadding = Math.max((yMax - yMin) * 0.15, 1);

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .nice()
      .range([innerHeight, 0]);

    /*
     * X axis
     */

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(sortedData.length, 6))
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    chartGroup
      .append('g')
      .attr('class', 'd3-line-chart__axis d3-line-chart__axis--x')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    /*
     * Y axis
     */

    const yAxis = d3.axisLeft(yScale).ticks(6);

    chartGroup
      .append('g')
      .attr('class', 'd3-line-chart__axis d3-line-chart__axis--y')
      .call(yAxis);

    /*
     * Horizontal grid lines
     */

    chartGroup
      .append('g')
      .attr('class', 'd3-line-chart__grid')
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
      .line<PartsPerMinutePoint>()
      .x((d) => xScale(new Date(d.timestamp)))
      .y((d) => yScale(d.partsPerMinute))
      .curve(d3.curveMonotoneX);

    chartGroup
      .append('path')
      .datum(sortedData)
      .attr('class', 'd3-line-chart__line')
      .attr('d', line);

    /*
     * Data points
     *
     * These make the chart useful even when there is
     * currently only one SSE event.
     */

    chartGroup
      .selectAll('.d3-line-chart__point')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'd3-line-chart__point')
      .attr('cx', (d) => xScale(new Date(d.timestamp)))
      .attr('cy', (d) => yScale(d.partsPerMinute))
      .attr('r', 3.5);

    /*
     * Y axis label
     */

    chartGroup
      .append('text')
      .attr('class', 'd3-line-chart__axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .text('Parts / minute');

    /*
     * X axis label
     */

    chartGroup
      .append('text')
      .attr('class', 'd3-line-chart__axis-label')
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
