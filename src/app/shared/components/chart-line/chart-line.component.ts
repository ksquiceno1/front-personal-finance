import { Component, effect, ElementRef, input, OnDestroy, ViewChild } from "@angular/core";
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
export class ChartLineComponent implements OnDestroy {
    @ViewChild("chart") chartRef!: ElementRef<HTMLCanvasElement>;
    private chart: Chart | null = null;

    public readonly data = input.required<ChartDataset[]>();
    public readonly labels = input.required<string[]>();

    constructor() {
        effect(() => {
            const data = this.data();
            const labels = this.labels();
            if (!this.chart) {
                return;
            }
            this.chart.data.labels = labels;
            this.chart.data.datasets = data;
            this.chart.update();
        });
    }

    ngAfterViewInit() {
        this.chart = new Chart(this.chartRef.nativeElement, {
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

    ngOnDestroy(): void {
        this.chart?.destroy();
    }
}
