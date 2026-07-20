import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartDoughnutComponent } from "../shared/components/chart-doughnut/chart-doughnut.component";
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule, ChartDoughnutComponent],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals {
  select: string = 'Todas';

  // Chart data for the bar chart
    incomeData: number[] = [1500000, 1200000, 1800000];
    expensesData: number[] = [80000, 480000, 400000];
    dataSets: ChartDataset[] = [
      {
        label: 'Ingresos', data: this.incomeData,
        borderColor: [
          'rgb(8, 117, 4)',
        ],
        backgroundColor: [
          'rgb(8, 117, 4)',
        ],
      },
      {
        label: 'Gastos', data: this.expensesData,
        borderColor: ['rgb(197, 33, 24)'],
        backgroundColor: ['rgb(197, 33, 24)'],
      }
    ];
    chartLabels: string[] = ['Abril', 'Mayo', 'Junio'];
}
