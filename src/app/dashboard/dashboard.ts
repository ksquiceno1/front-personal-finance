import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartBarComponent } from '../shared/components/chart-bar/chart-bar.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ChartBarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  chartData: number[] = [65, 59, 80, 81, 56, 55, 40];
  chartLabels: string[] = ['Abril', 'Mayo', 'Junio'];
  nombre: string = 'Usuario';
  date: string = new Date().toISOString().split('T')[0];
  income: number = 600000;
  expenses: number = 230000;

  get balance(): number {
    return this.income - this.expenses;
  }
}
