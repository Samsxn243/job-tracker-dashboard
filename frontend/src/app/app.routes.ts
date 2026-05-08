import { Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@app/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/components/kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent)
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/components/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  { path: '**', redirectTo: '' }
];
