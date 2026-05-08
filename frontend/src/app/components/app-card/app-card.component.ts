import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Application } from '@app/models/application.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" (click)="edit.emit(app)">
      <div class="card-header">
        <h4 class="company">{{ app.company }}</h4>
        <button class="btn-delete" (click)="onDelete($event)" title="Delete">×</button>
      </div>
      <p class="role">{{ app.role }}</p>
      <div class="card-meta">
        <span class="date" *ngIf="app.dateApplied">{{ app.dateApplied | date:'MMM d' }}</span>
        <span class="location" *ngIf="app.location">{{ app.location }}</span>
      </div>
      <div class="tags" *ngIf="app.tags?.length">
        <span class="tag" *ngFor="let tag of app.tags.slice(0, 3)">{{ tag }}</span>
        <span class="tag tag-more" *ngIf="app.tags.length > 3">+{{ app.tags.length - 3 }}</span>
      </div>
      <p class="note" *ngIf="app.notes?.length">{{ app.notes[app.notes.length - 1] }}</p>
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transform: translateY(-1px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .company {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .card:hover .btn-delete { opacity: 1; }
    .btn-delete:hover { color: var(--status-rejected); }

    .role {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0.2rem 0 0.5rem;
    }

    .card-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-bottom: 0.5rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-bottom: 0.4rem;
    }

    .tag {
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: var(--accent-faint);
      color: var(--accent);
      font-weight: 500;
    }

    .tag-more {
      background: var(--bg-primary);
      color: var(--text-tertiary);
    }

    .note {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class AppCardComponent {
  @Input({ required: true }) app!: Application;
  @Output() edit = new EventEmitter<Application>();
  @Output() remove = new EventEmitter<string>();

  onDelete(e: Event) {
    e.stopPropagation();
    this.remove.emit(this.app.id);
  }
}
