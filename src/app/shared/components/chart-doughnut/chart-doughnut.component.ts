import { Component, effect, ElementRef, input, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    ChartDataset,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title);

@Component({
    selector: "app-chart-doughnut",
    imports: [CommonModule],
    templateUrl: "./chart-doughnut.component.html",
    styleUrl: "./chart-doughnut.component.scss",
})
export class ChartDoughnutComponent implements OnDestroy {
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
            type: "doughnut",
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
            },
        });
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
    }
}
