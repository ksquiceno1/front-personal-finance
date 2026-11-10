import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartBarComponent } from '../shared/components/chart-bar/chart-bar.component';
import { FormTransactionComponent } from '../shared/components/form-transaction/form-transaction.component';
import { AuthService } from '../shared/services/auth.service';
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ChartBarComponent, FormTransactionComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);

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
  showTransactionModal = false;

  username = '';
  userLoadError = '';
  isLoadingUser = true;
  date: string = new Date().toISOString().split('T')[0];
  income: number = 600000;
  expenses: number = 230000;

  get formattedDate(): string {
    const date = new Date(this.date);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }

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

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.username = user.username;
      },
      error: (error: unknown) => {
        this.userLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar la información del usuario.';
        this.isLoadingUser = false;
      },
      complete: () => {
        this.isLoadingUser = false;
      },
    });
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
  }
}
