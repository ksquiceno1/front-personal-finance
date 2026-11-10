import { Component, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly mode: AuthMode = this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login';
  readonly credentials = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  statusMessage = '';
  errorMessage = '';
  isSubmitting = false;

  get passwordsDoNotMatch(): boolean {
    return this.mode === 'register' &&
      this.credentials.confirmPassword.length > 0 &&
      this.credentials.password !== this.credentials.confirmPassword;
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || this.passwordsDoNotMatch) {
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = '';
    this.errorMessage = '';

    try {
      if (this.mode === 'register') {
        await firstValueFrom(this.authService.register({
          username: this.credentials.username,
          email: this.credentials.email,
          password: this.credentials.password,
        }));
        this.statusMessage = 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.';
        this.credentials.password = '';
        this.credentials.confirmPassword = '';
        form.controls['password']?.reset('');
        form.controls['confirmPassword']?.reset('');
      } else {
        await firstValueFrom(this.authService.login({
          username: this.credentials.username,
          password: this.credentials.password,
        }));
        await this.router.navigate(['/dashboard']);
      }
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error
        ? error.message
        : 'No se pudo completar la solicitud. Inténtalo de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
