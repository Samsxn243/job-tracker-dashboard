import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <h1>Job Tracker</h1>
          <p>{{ isRegister ? 'Create your account' : 'Welcome back' }}</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="field" *ngIf="isRegister">
            <label for="name">Display Name</label>
            <input id="name" type="text" [(ngModel)]="displayName" name="displayName"
                   placeholder="Your name" />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   placeholder="you@example.com" required />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   placeholder="••••••••" required />
          </div>

          <p class="error" *ngIf="error">{{ error }}</p>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In') }}
          </button>
        </form>

        <p class="toggle">
          {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
          <a (click)="isRegister = !isRegister; error = ''">
            {{ isRegister ? 'Sign in' : 'Create one' }}
          </a>
        </p>

        <div class="demo-hint">
          <strong>Demo:</strong> demo&#64;jobtracker.dev / password123
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem;
    }

    .login-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .field {
      margin-bottom: 1.25rem;
    }

    .field label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field input {
      width: 100%;
      padding: 0.7rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.95rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .field input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-faint);
    }

    .error {
      color: var(--status-rejected);
      font-size: 0.85rem;
      margin: 0 0 1rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .toggle {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .toggle a {
      color: var(--accent);
      cursor: pointer;
      font-weight: 600;
    }

    .demo-hint {
      text-align: center;
      margin-top: 1.25rem;
      padding: 0.75rem;
      background: var(--bg-primary);
      border-radius: 8px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  displayName = '';
  isRegister = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    const req$ = this.isRegister
      ? this.auth.register(this.email, this.password, this.displayName)
      : this.auth.login(this.email, this.password);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
