import { Component, ElementRef, input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Chart } from 'chart.js';

@Component({
    selector: 'app-chart-bar',
    imports: [CommonModule],
    templateUrl: './chart-bar.component.html',
    styleUrl: './chart-bar.component.scss',
})
export class ChartBarComponent {
    @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;

    public readonly data = input.required<number[]>();
    public readonly labels = input.required<string[]>();

    ngAfterViewInit() {
        new Chart(this.chartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: this.labels(),
                datasets: [{ label: 'Ventas', data: this.data() }]
            }
        });
    }
}