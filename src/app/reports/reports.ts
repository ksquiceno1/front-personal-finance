import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartDataset } from 'chart.js';
import { ChartLineComponent } from '../shared/components/chart-line/chart-line.component';
import { ChartDoughnutComponent } from '../shared/components/chart-doughnut/chart-doughnut.component';
import { ChartBarComponent } from "../shared/components/chart-bar/chart-bar.component";

@Component({
  selector: 'app-reports',
  imports: [CommonModule, ChartLineComponent, ChartDoughnutComponent, FormsModule, ReactiveFormsModule, ChartBarComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
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

  startDate: string = this.getDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  endDate: string = this.getDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  get formattedDateRangeStart(): string {
    return `${this.formatDate(this.startDate)}`;
  }

  get formattedDateRangeEnd(): string {
    return `${this.formatDate(this.endDate)}`;
  }

  select: string = 'Mensual';

  private getDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  onStartDateChange() {
    console.log(this.startDate);
  }

  onEndDateChange() {
    console.log(this.endDate);
  }
}
