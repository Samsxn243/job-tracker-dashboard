import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '@app/services/application.service';
import { AnalyticsSummary, STATUS_COLORS, STATUS_LABELS } from '@app/models/application.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <h2 class="page-title">Analytics</h2>

      <!-- Stat Cards -->
      <div class="stat-cards" *ngIf="data">
        <div class="stat-card">
          <span class="stat-value">{{ data.totalApplications }}</span>
          <span class="stat-label">Total Applications</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ data.responseRate }}%</span>
          <span class="stat-label">Response Rate</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ data.byStatus['INTERVIEW'] || 0 }}</span>
          <span class="stat-label">In Interview</span>
        </div>
        <div class="stat-card accent">
          <span class="stat-value">{{ data.byStatus['OFFER'] || 0 }}</span>
          <span class="stat-label">Offers</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="chart-grid" *ngIf="data">
        <div class="chart-card">
          <h3>Applications by Status</h3>
          <canvas #statusChart></canvas>
        </div>
        <div class="chart-card">
          <h3>Weekly Activity</h3>
          <canvas #weeklyChart></canvas>
        </div>
        <div class="chart-card">
          <h3>Top Tags</h3>
          <canvas #tagChart></canvas>
        </div>
        <div class="chart-card">
          <h3>Outcome Breakdown</h3>
          <canvas #outcomeChart></canvas>
        </div>
      </div>

      <div class="loading" *ngIf="!data">Loading analytics...</div>
    </div>
  `,
  styles: [`
    .analytics-page { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }

    .page-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.25rem;
    }

    .stat-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }

    .stat-card.accent {
      border-color: var(--accent);
      background: var(--accent-faint);
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-card.accent .stat-value { color: var(--accent); }

    .stat-label {
      font-size: 0.78rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-weight: 500;
      margin-top: 0.25rem;
      display: block;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .chart-card h3 {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: var(--text-tertiary);
    }

    @media (max-width: 768px) {
      .stat-cards { grid-template-columns: repeat(2, 1fr); }
      .chart-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weeklyChart') weeklyCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tagChart') tagCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('outcomeChart') outcomeCanvas!: ElementRef<HTMLCanvasElement>;

  data: AnalyticsSummary | null = null;

  constructor(private appService: ApplicationService) {}

  ngOnInit() {
    this.appService.getAnalytics().subscribe(d => {
      this.data = d;
      setTimeout(() => this.renderCharts(), 0);
    });
  }

  ngAfterViewInit() {}

  private renderCharts() {
    if (!this.data) return;
    this.renderStatusChart();
    this.renderWeeklyChart();
    this.renderTagChart();
    this.renderOutcomeChart();
  }

  private renderStatusChart() {
    const labels = Object.keys(this.data!.byStatus).map(
      s => (STATUS_LABELS as any)[s] || s
    );
    const values = Object.values(this.data!.byStatus);
    const colors = Object.keys(this.data!.byStatus).map(
      s => (STATUS_COLORS as any)[s] || '#6B7280'
    );

    new Chart(this.statusCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderRadius: 6, barThickness: 28 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private renderWeeklyChart() {
    const entries = Object.entries(this.data!.byWeek).slice(-8);
    new Chart(this.weeklyCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: entries.map(([w]) => w),
        datasets: [{
          data: entries.map(([, v]) => v),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#3B82F6'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private renderTagChart() {
    const sorted = Object.entries(this.data!.byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    new Chart(this.tagCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: sorted.map(([t]) => t),
        datasets: [{
          data: sorted.map(([, v]) => v),
          backgroundColor: '#8B5CF6',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  private renderOutcomeChart() {
    const bs = this.data!.byStatus;
    const segments = [
      { label: 'Progressing', value: (bs['PHONE_SCREEN'] || 0) + (bs['INTERVIEW'] || 0), color: '#F59E0B' },
      { label: 'Offers', value: bs['OFFER'] || 0, color: '#10B981' },
      { label: 'Rejected', value: bs['REJECTED'] || 0, color: '#EF4444' },
      { label: 'Waiting', value: (bs['APPLIED'] || 0) + (bs['WISHLIST'] || 0), color: '#6B7280' }
    ].filter(s => s.value > 0);

    new Chart(this.outcomeCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: segments.map(s => s.label),
        datasets: [{
          data: segments.map(s => s.value),
          backgroundColor: segments.map(s => s.color),
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
        }
      }
    });
  }
}
