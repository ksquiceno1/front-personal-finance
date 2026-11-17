import { AfterViewInit, Component, ElementRef, input, OnChanges, OnDestroy, ViewChild } from "@angular/core";
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
    ChartDataset,
    ChartConfiguration
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
@Component({
    selector: 'app-chart-bar',
    imports: [CommonModule],
    templateUrl: './chart-bar.component.html',
    styleUrl: './chart-bar.component.scss',
})
export class ChartBarComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;

    public readonly data = input.required<ChartDataset[]>();
    public readonly labels = input.required<string[]>();
    public readonly orientation = input<'vertical' | 'horizontal'>('vertical');
    private chart?: Chart;

    ngAfterViewInit(): void {
        this.chart = new Chart(
            this.chartRef.nativeElement,
            this.buildChartConfig(this.labels(), this.data(), this.orientation()),
        );
    }

    ngOnChanges(): void {
        if (this.chart) {
            this.chart.data.labels = this.labels();
            this.chart.data.datasets = this.data();
            this.chart.options.indexAxis = this.orientation() === 'horizontal' ? 'y' : 'x';
            this.chart.update();
        }
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
    }

    protected buildChartConfig(labels: string[], data: ChartDataset[], orientation: 'vertical' | 'horizontal'): ChartConfiguration {
        return {
            type: 'bar',
            data: {
                labels,
                datasets: data,
            },
            options: {
                responsive: true,
                indexAxis: orientation === 'horizontal' ? 'y' : 'x',
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            },
        };
    }
}