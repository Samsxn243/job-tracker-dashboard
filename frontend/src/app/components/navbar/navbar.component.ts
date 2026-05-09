import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ApplicationService } from '@app/services/application.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <a routerLink="/" class="logo">
          <span class="logo-icon">◆</span> Job Tracker
        </a>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Board</a>
        <a routerLink="/analytics" routerLinkActive="active" class="nav-link">Analytics</a>
      </div>
      <div class="nav-right">
        <button class="btn-ghost" (click)="exportCsv()" title="Export as CSV">
          ↓ Export
        </button>
        <button class="btn-theme" (click)="toggleTheme()" [title]="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <span class="user-name">{{ auth.currentUser?.displayName }}</span>
        <button class="btn-ghost btn-logout" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 56px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-left, .nav-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .logo {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
      text-decoration: none;
      margin-right: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .logo-icon {
      color: var(--accent);
      font-size: 0.9rem;
    }

    .nav-link {
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s;
    }

    .nav-link:hover { color: var(--text-primary); background: var(--bg-primary); }
    .nav-link.active { color: var(--accent); background: var(--accent-faint); }

    .user-name {
      font-size: 0.85rem;
      color: var(--text-secondary);
      padding: 0 0.5rem;
    }

    .btn-ghost {
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-ghost:hover {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .btn-theme {
      padding: 0.35rem 0.55rem;
      border-radius: 6px;
      background: none;
      border: 1px solid var(--border);
      cursor: pointer;
      font-size: 0.95rem;
      line-height: 1;
      transition: all 0.15s;
    }

    .btn-theme:hover {
      background: var(--bg-primary);
    }

    .btn-logout { color: var(--status-rejected); border-color: transparent; }
  `]
})
export class NavbarComponent implements OnInit {
  isDark = false;

  constructor(public auth: AuthService, private appService: ApplicationService) {}

  ngOnInit() {
    const saved = localStorage.getItem('jt_theme');
    if (saved) {
      this.isDark = saved === 'dark';
    } else {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('jt_theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }

  exportCsv() {
    this.appService.exportCsv();
  }

  logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}
