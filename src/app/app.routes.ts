import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: 'login',
        loadComponent: () => import('./auth/auth').then(m => m.Auth),
        data: { mode: 'login' }
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/auth').then(m => m.Auth),
        data: { mode: 'register' }
    },
    {
        path: '',
        component: Layout,
        canActivate: [authGuard],
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
            },
            {
                path: 'budgets',
                loadComponent: () => import('./budgets/budgets').then(m => m.Budgets)
            },
            {
                path: 'reports',
                loadComponent: () => import('./reports/reports').then(m => m.Reports)
            },
            {
                path: 'goals',
                loadComponent: () => import('./goals/goals').then(m => m.Goals)
            },
            {
                path: 'settings',
                loadComponent: () => import('./settings/settings').then(m => m.Settings)
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
