import { Component, ElementRef, input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ChartDataset,
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

@Component({
    selector: "app-chart-line",
    imports: [CommonModule],
    templateUrl: "./chart-line.component.html",
    styleUrl: "./chart-line.component.scss",
})
export class ChartLineComponent {
    @ViewChild("chart") chartRef!: ElementRef<HTMLCanvasElement>;

    public readonly data = input.required<ChartDataset[]>();
    public readonly labels = input.required<string[]>();

    ngAfterViewInit() {
        new Chart(this.chartRef.nativeElement, {
            type: "line",
            data: {
                labels: this.labels(),
                datasets: this.data(),
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                },
                elements: {
                    line: {
                        tension: 0.3,
                        fill: false,
                    },
                },
            },
        });
    }
}
