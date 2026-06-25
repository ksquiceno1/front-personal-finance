import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartBarComponent } from '../shared/components/chart-bar/chart-bar.component';
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ChartBarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // Chart data for the bar chart
  incomeData: number[] = [1500000, 1200000, 1800000];
  expensesData: number[] = [80000, 480000, 400000];
  dataSets: ChartDataset[] = [
    {
      label: 'Ingresos', data: this.incomeData,
      backgroundColor: [
        'rgb(8, 117, 4)',
      ],
      borderRadius: 5,
    },
    {
      label: 'Gastos', data: this.expensesData,
      backgroundColor: ['rgb(197, 33, 24)'],
      borderRadius: 5,
    }
  ];
  chartLabels: string[] = ['Abril', 'Mayo', 'Junio'];

  select: string = 'Mensual';

  nombre: string = 'Usuario';
  date: string = new Date().toISOString().split('T')[0];
  income: number = 600000;
  expenses: number = 230000;

  transactions = [
    {
      type: 'expense',
      name: 'Compra en Supermercado',
      amount: 150000,
      icon: 'fa-solid fa-cart-shopping',
      date: '2024-06-15',
    },
    {
      type: 'expense',
      name: 'Arriendo',
      amount: 600000,
      icon: 'fa-regular fa-house',
      date: '2024-06-05',
    }
  ]

  get balance(): number {
    return this.income - this.expenses;
  }
}
