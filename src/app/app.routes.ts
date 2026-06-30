import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [{
    path: '',
    component: Layout,
    children: [
        {
            path: 'dashboard',
            loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
        },
        {
            path: 'transactions',
            loadComponent: () => import('./transactions/transactions').then(m => m.Transactions)
        },
        {
            path: 'categories',
            loadComponent: () => import('./categories/categories').then(m => m.Categories)
        }
    ]
}];
