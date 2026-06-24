import { Component, ElementRef, input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ChartDataset
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
@Component({
    selector: 'app-chart-bar',
    imports: [CommonModule],
    templateUrl: './chart-bar.component.html',
    styleUrl: './chart-bar.component.scss',
})
export class ChartBarComponent {
    @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;

    public readonly data = input.required<ChartDataset[]>();
    public readonly labels = input.required<string[]>();

    ngAfterViewInit() {
        new Chart(this.chartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: this.labels(),
                datasets: this.data()
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            },
        });
    }
}