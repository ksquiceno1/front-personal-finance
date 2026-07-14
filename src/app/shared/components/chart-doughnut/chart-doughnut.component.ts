import { Component, ElementRef, input, ViewChild } from "@angular/core";
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
export class ChartDoughnutComponent {
    @ViewChild("chart") chartRef!: ElementRef<HTMLCanvasElement>;

    public readonly data = input.required<ChartDataset[]>();
    public readonly labels = input.required<string[]>();

    ngAfterViewInit() {
        new Chart(this.chartRef.nativeElement, {
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
}
