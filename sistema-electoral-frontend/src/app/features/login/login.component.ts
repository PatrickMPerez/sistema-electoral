import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="login-bg">
    <mat-card class="login-card">
      <div class="login-header">
        <mat-icon class="logo">how_to_vote</mat-icon>
        <h1>Sistema Electoral</h1>
        <p>Control de Votación</p>
      </div>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" autocomplete="username" placeholder="Ej: admin">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="form.get('username')?.hasError('required')">Campo requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="showPass.set(!showPass())">
              <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Campo requerido</mat-error>
          </mat-form-field>

          @if (error()) {
            <div class="login-error">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <button mat-raised-button color="primary" type="submit"
                  class="full-width login-btn" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="20" color="accent"></mat-spinner>
            } @else {
              <mat-icon>login</mat-icon> Ingresar
            }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%);
    }
    .login-card { width: 380px; padding: 16px; border-radius: 12px !important; }
    .login-header { text-align: center; padding: 16px 0 8px; }
    .logo { font-size: 56px; width: 56px; height: 56px; color: #1a237e; }
    .login-header h1 { margin: 8px 0 4px; font-size: 22px; font-weight: 700; color: #1a237e; }
    .login-header p  { margin: 0 0 16px; color: #666; font-size: 14px; }
    .login-btn { height: 44px; font-size: 15px; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .login-error {
      display: flex; align-items: center; gap: 8px;
      background: #ffebee; color: #c62828; padding: 10px 14px;
      border-radius: 6px; margin-bottom: 12px; font-size: 14px;
    }
    mat-form-field { margin-bottom: 4px; }
  `]
})
export class LoginComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading  = signal(false);
  error    = signal('');
  showPass = signal(false);

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: res => {
        const role = res.user.role;
        this.router.navigate(role === 'vedor' ? ['/control-votacion'] : ['/dashboard']);
      },
      error: err => {
        const msg = err?.error?.errors?.username?.[0] ?? err?.error?.message ?? 'Error al iniciar sesión';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
