import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartCircleComponent } from '../shared/components/chart-circle/chart-circle.component';
import { TableDynamicComponent } from "../shared/components/table-dynamic/table-dynamic.component";

@Component({
  selector: 'app-budgets',
  imports: [CommonModule, FormsModule, ChartCircleComponent, TableDynamicComponent],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {
  date: string = new Date().toISOString().split('T')[0];
  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'period', label: 'Periodo' },
    { key: 'asign', label: 'Total Asignado' },
    { key: 'expense', label: 'Gastado' },
    { key: 'state', label: 'Estado' },
    { key: 'actions', label: 'Acciones' }
  ]
  rows = [
    { name: 'Alimentación', period: '2023-10', asign: '$500.000', expense: '$300.000', state: 'Activo', actions: '' },
    { name: 'Transporte', period: '2023-10', asign: '$300.000', expense: '$150.000', state: 'Activo', actions: '' },
    { name: 'Entretenimiento', period: '2023-10', asign: '$200.000', expense: '$100.000', state: 'Activo', actions: '' }
  ];

  get formattedDate(): string {
    const date = new Date(this.date);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }
}
