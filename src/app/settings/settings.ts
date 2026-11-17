import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoggingOut = false;
  logoutError = '';

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.logoutError = '';
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        this.logoutError = error instanceof Error
          ? error.message
          : 'No se pudo cerrar la sesión. Inténtalo de nuevo.';
        this.isLoggingOut = false;
      },
    });
  }
}
