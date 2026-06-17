import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout { 
  routes = [
    {
      icon: 'fa-regular fa-house',
      label: 'Dashboard',
      url: '/'
    },
    {
      icon: 'fa-regular fa-credit-card',
      label: 'Transacciones',
      url: '/transactions'
    },
    {
      icon: 'fa-solid fa-briefcase',
      label: 'Categorías',
      url: '/categories'
    },
    {
      icon: 'fa-regular fa-calendar-days',
      label: 'Presupuestos',
      url: '/budgets'
    },
    {
      icon: 'fa-solid fa-chart-column',
      label: 'Reportes',
      url: '/reports'
    },
    {
      icon: 'fa-solid fa-thumbtack',
      label: 'Metas',
      url: '/goals'
    },
    {
      icon: 'fa-solid fa-gear',
      label: 'Configuración',
      url: '/settings'
    },

  ]
}
