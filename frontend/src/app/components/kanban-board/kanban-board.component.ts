import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApplicationService } from '@app/services/application.service';
import {
  Application,
  ApplicationStatus,
  KANBAN_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS
} from '@app/models/application.model';
import { AppCardComponent } from '@app/components/app-card/app-card.component';
import { AppFormComponent } from '@app/components/app-form/app-form.component';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, AppCardComponent, AppFormComponent, ConfirmDialogComponent],
  template: `
    <!-- Toast notification -->
    <div class="toast" *ngIf="toast" [class.toast-error]="toastType === 'error'">
      {{ toast }}
    </div>

    <div class="board-toolbar">
      <div class="toolbar-left">
        <input class="search-input" type="text"
               placeholder="Search companies, roles... (Ctrl+K)"
               [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
               #searchInput />
        <span class="app-count">{{ totalCount }} applications</span>
      </div>
      <button class="btn-add" (click)="openCreate()">+ New Application</button>
    </div>

    <!-- Loading skeleton -->
    <div class="board" *ngIf="loading">
      <div class="column" *ngFor="let _ of [1,2,3,4,5]">
        <div class="column-header">
          <div class="skeleton skeleton-dot"></div>
          <div class="skeleton skeleton-title"></div>
        </div>
        <div class="column-body">
          <div class="skeleton skeleton-card" *ngFor="let _ of [1,2]"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div class="error-state" *ngIf="error && !loading">
      <p class="error-icon">⚠</p>
      <p class="error-msg">{{ error }}</p>
      <button class="btn-retry" (click)="loadApplications()">Try Again</button>
    </div>

    <!-- Kanban board -->
    <div class="board" *ngIf="!loading && !error">
      <div class="column" *ngFor="let status of statuses">
        <div class="column-header">
          <div class="column-dot" [style.background]="statusColors[status]"></div>
          <span class="column-title">{{ statusLabels[status] }}</span>
          <span class="column-count">{{ columns[status]?.length || 0 }}</span>
        </div>

        <div class="column-body"
             cdkDropList
             [id]="status"
             [cdkDropListData]="columns[status]"
             [cdkDropListConnectedTo]="statuses"
             (cdkDropListDropped)="onDrop($event)">

          <div *ngFor="let app of columns[status]" cdkDrag [cdkDragData]="app">
            <app-card
              [app]="app"
              (edit)="openEdit($event)"
              (remove)="confirmDelete($event)">
            </app-card>
          </div>

          <div class="empty-state" *ngIf="!columns[status]?.length">
            <span class="empty-icon">{{ getEmptyIcon(status) }}</span>
            <span>{{ getEmptyText(status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <app-form *ngIf="showForm"
              [application]="selectedApp"
              (close)="closeForm()"
              (save)="onSave($event)">
    </app-form>

    <!-- Delete Confirmation -->
    <app-confirm-dialog *ngIf="deleteId"
                        [message]="'Delete this application from ' + deleteName + '?'"
                        (confirm)="onDeleteConfirm()"
                        (cancel)="deleteId = null">
    </app-confirm-dialog>
  `,
  styles: [`
    /* ── Toast ── */
    .toast {
      position: fixed;
      top: 68px;
      right: 1.5rem;
      background: var(--status-offer);
      color: #fff;
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      z-index: 500;
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.2s forwards;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .toast-error { background: var(--status-rejected); }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-8px); }
    }

    /* ── Toolbar ── */
    .board-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      gap: 1rem;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-input {
      padding: 0.5rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--bg-card);
      color: var(--text-primary);
      width: 300px;
      font-family: inherit;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-faint);
    }

    .app-count {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }

    .btn-add {
      padding: 0.55rem 1.1rem;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .btn-add:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── Board ── */
    .board {
      display: flex;
      gap: 0.75rem;
      padding: 0 1.5rem 1.5rem;
      overflow-x: auto;
      min-height: calc(100vh - 130px);
    }

    .column {
      min-width: 260px;
      max-width: 280px;
      flex-shrink: 0;
    }

    .column-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.5rem;
      margin-bottom: 0.5rem;
    }

    .column-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .column-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .column-count {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      background: var(--bg-primary);
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
    }

    .column-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 100px;
      padding: 0.5rem;
      background: var(--bg-primary);
      border-radius: 10px;
      border: 1px solid transparent;
      transition: border-color 0.2s;
    }

    .column-body.cdk-drop-list-dragging {
      border-color: var(--accent);
      background: var(--accent-faint);
    }

    /* ── Empty states ── */
    .empty-state {
      text-align: center;
      padding: 2rem 0.5rem;
      font-size: 0.8rem;
      color: var(--text-tertiary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
    }

    .empty-icon { font-size: 1.3rem; }

    /* ── Error state ── */
    .error-state {
      text-align: center;
      padding: 4rem 1rem;
    }

    .error-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

    .error-msg {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }

    .btn-retry {
      padding: 0.55rem 1.25rem;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    /* ── Skeleton loading ── */
    .skeleton {
      background: linear-gradient(90deg,
        var(--border) 25%, var(--bg-card) 50%, var(--border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 6px;
    }

    .skeleton-dot { width: 8px; height: 8px; border-radius: 50%; }
    .skeleton-title { width: 80px; height: 14px; }
    .skeleton-card { height: 90px; border-radius: 10px; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── Drag styles ── */
    .cdk-drag-preview {
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .cdk-drag-placeholder { opacity: 0.3; }

    .cdk-drag-animating { transition: transform 200ms ease; }
  `]
})
export class KanbanBoardComponent implements OnInit {
  statuses = KANBAN_STATUSES;
  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;

  columns: Record<string, Application[]> = {};
  allApps: Application[] = [];
  searchQuery = '';
  totalCount = 0;

  loading = true;
  error = '';

  showForm = false;
  selectedApp: Application | null = null;
  deleteId: string | null = null;
  deleteName = '';

  toast = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any;

  constructor(private appService: ApplicationService) {
    this.statuses.forEach(s => this.columns[s] = []);
  }

  // Ctrl+K to focus search
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>('.search-input');
      input?.focus();
    }
    if (e.key === 'Escape') {
      if (this.showForm) this.closeForm();
    }
  }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.error = '';

    this.appService.getAll().subscribe({
      next: (apps) => {
        this.allApps = apps;
        this.distributeToColumns(apps);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications. Is the backend running?';
        this.loading = false;
      }
    });
  }

  private distributeToColumns(apps: Application[]) {
    this.statuses.forEach(s => this.columns[s] = []);
    apps.forEach(app => {
      if (this.columns[app.status]) {
        this.columns[app.status].push(app);
      }
    });
    this.totalCount = apps.length;
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.distributeToColumns(this.allApps);
      return;
    }
    const q = this.searchQuery.toLowerCase();
    const filtered = this.allApps.filter(a =>
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    );
    this.distributeToColumns(filtered);
  }

  onDrop(event: CdkDragDrop<Application[]>) {
    if (event.previousContainer === event.container) return;

    const app: Application = event.item.data;
    const newStatus = event.container.id as ApplicationStatus;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.appService.updateStatus(app.id, newStatus).subscribe({
      next: (updated) => {
        const idx = this.allApps.findIndex(a => a.id === app.id);
        if (idx >= 0) this.allApps[idx] = updated;
        this.showToast(`Moved ${app.company} to ${this.statusLabels[newStatus]}`);
      },
      error: () => {
        this.showToast('Failed to update status', 'error');
        this.loadApplications();
      }
    });
  }

  openCreate() {
    this.selectedApp = null;
    this.showForm = true;
  }

  openEdit(app: Application) {
    this.selectedApp = app;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedApp = null;
  }

  onSave(data: Partial<Application>) {
    if (this.selectedApp) {
      this.appService.update(this.selectedApp.id, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadApplications();
          this.showToast('Application updated');
        },
        error: () => this.showToast('Failed to save changes', 'error')
      });
    } else {
      this.appService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadApplications();
          this.showToast('Application created');
        },
        error: () => this.showToast('Failed to create application', 'error')
      });
    }
  }

  confirmDelete(id: string) {
    const app = this.allApps.find(a => a.id === id);
    this.deleteName = app?.company || '';
    this.deleteId = id;
  }

  onDeleteConfirm() {
    if (!this.deleteId) return;
    const name = this.deleteName;
    this.appService.delete(this.deleteId).subscribe({
      next: () => {
        this.deleteId = null;
        this.loadApplications();
        this.showToast(`Deleted ${name}`);
      },
      error: () => this.showToast('Failed to delete', 'error')
    });
  }

  getEmptyIcon(status: ApplicationStatus): string {
    const icons: Record<string, string> = {
      WISHLIST: '📋', APPLIED: '📨', PHONE_SCREEN: '📞',
      INTERVIEW: '💬', OFFER: '🎉', REJECTED: '—', WITHDRAWN: '—'
    };
    return icons[status] || '📋';
  }

  getEmptyText(status: ApplicationStatus): string {
    const texts: Record<string, string> = {
      WISHLIST: 'Save jobs you\'re eyeing',
      APPLIED: 'Drag cards here when applied',
      PHONE_SCREEN: 'Phone screens land here',
      INTERVIEW: 'Interviews in progress',
      OFFER: 'Offers will show here 🤞',
      REJECTED: 'Nothing here yet',
      WITHDRAWN: 'Cards you pulled out'
    };
    return texts[status] || 'Drop here';
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = message;
    this.toastType = type;
    this.toastTimer = setTimeout(() => this.toast = '', 2500);
  }
}
