import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, ViewChildren, QueryList, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { TranslateModule } from '@ngx-translate/core';
import { ProductosService } from '../../../services/productos.service';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { LanguageService } from '../../../services/language.service';
import { APP_VERSION } from '../../../constants/version';
interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    status: string;
}
interface DashboardStats {
    total_revenue: number;
    revenue_change: number;
    low_stock_count: number;
    system_status: 'online' | 'offline' | 'maintenance';
}
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, BaseChartDirective, AdminSidebarComponent, TranslateModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly router = inject(Router);
    private readonly productosService = inject(ProductosService);
    private readonly languageService = inject(LanguageService);
    private themeObserver?: MutationObserver;
    appVersion = APP_VERSION;
    @ViewChildren(BaseChartDirective)
    charts!: QueryList<BaseChartDirective>;
    periodoSeleccionado: '7d' | '30d' | '90d' = '7d';
    stats = signal<DashboardStats>({
        total_revenue: 0,
        revenue_change: 0,
        low_stock_count: 0,
        system_status: 'online'
    });
    loading = signal(true);
    connectionLost = signal(false);
    lowStockProducts = signal<LowStockProduct[]>([]);
    ngOnInit() {
        this.loadDashboardData();
    }
    ngAfterViewInit() {
        this.applyCurrentThemeToCharts();
        this.charts.changes.subscribe(() => {
            this.applyCurrentThemeToCharts();
        });
        if (isPlatformBrowser(this.platformId)) {
            this.themeObserver = new MutationObserver(() => {
                this.applyCurrentThemeToCharts();
            });
            this.themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        }
    }
    ngOnDestroy() {
        this.themeObserver?.disconnect();
    }
    private updateChartColors() {
        const isDark = document.documentElement.dataset['theme'] !== 'light';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const labelColor = isDark ? '#e2e8f0' : '#1e293b';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        this.applyScaleColors(this.lineChartOptions?.scales, {
            x: { ticks: textColor },
            y: { ticks: textColor, grid: gridColor }
        });
        this.applyScaleColors(this.barChartOptions?.scales, {
            x: { ticks: textColor, grid: gridColor },
            y: { ticks: labelColor }
        });
        this.charts?.forEach(chartDirective => {
            const chart = chartDirective.chart;
            if (!chart?.options?.scales) return;
            const isHorizontalBar = chart.options.indexAxis === 'y';
            this.applyScaleColors(chart.options.scales, {
                x: { ticks: textColor, grid: gridColor },
                y: {
                    ticks: isHorizontalBar ? labelColor : textColor,
                    grid: isHorizontalBar ? undefined : gridColor
                }
            });
        });
        this.updateAllCharts();
    }
    private applyScaleColors(
        scales: unknown,
        config: Record<string, { ticks?: string; grid?: string }>
    ): void {
        if (!scales) return;
        const typedScales = scales as Record<string, {
            ticks?: { color?: string };
            grid?: { color?: string };
        }>;
        for (const [axis, colors] of Object.entries(config)) {
            if (colors.ticks && typedScales[axis]?.ticks) {
                typedScales[axis].ticks.color = colors.ticks;
            }
            if (colors.grid && typedScales[axis]?.grid) {
                typedScales[axis].grid.color = colors.grid;
            }
        }
    }
    async loadDashboardData() {
        this.loading.set(true);
        this.connectionLost.set(false);
        try {
            this.stats.set(await this.withTimeout(this.productosService.getDashboardStats(), 8000));
            if (this.stats().system_status === 'offline') {
                this.connectionLost.set(true);
                return;
            }
            await this.updateRevenueChart();
            const topProducts = await this.withTimeout(this.productosService.getTopSellingProducts(), 8000);
            this.barChartData.labels = topProducts.map(p => p.name);
            this.barChartData.datasets[0].data = topProducts.map(p => p.sold);
            this.lowStockProducts.set(await this.withTimeout(this.productosService.getLowStockProducts(), 8000));
            this.updateAllCharts();
        }
        catch {
            this.connectionLost.set(true);
            this.barChartData.labels = [];
            this.barChartData.datasets[0].data = [];
            this.lineChartData.labels = [];
            this.lineChartData.datasets[0].data = [];
            this.lowStockProducts.set([]);
            this.stats.set({
                total_revenue: 0,
                revenue_change: 0,
                low_stock_count: 0,
                system_status: 'offline'
            });
        }
        finally {
            this.loading.set(false);
        }
    }
    get systemStatusLabel(): string {
        const map: Record<DashboardStats['system_status'], string> = {
            online: 'ADMIN.SYSTEM_ONLINE',
            offline: 'ADMIN.SYSTEM_OFFLINE',
            maintenance: 'ADMIN.SYSTEM_MAINTENANCE'
        };
        return this.languageService.instant(map[this.stats().system_status]);
    }
    public lineChartData: ChartConfiguration['data'] = {
        datasets: [
            {
                data: [],
                label: this.languageService.instant('ADMIN.SALES_LABEL'),
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                borderColor: '#0ea5e9',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0ea5e9',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(14, 165, 233, 0.8)',
                fill: 'origin',
                tension: 0.4
            }
        ],
        labels: []
    };
    public lineChartOptions: ChartConfiguration['options'] = {
        elements: {
            line: {
                tension: 0.4
            }
        },
        scales: {
            y: {
                position: 'left',
                grid: {
                    color: 'rgba(255,255,255,0.05)'
                },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: { color: '#94a3b8' }
            }
        },
        plugins: {
            legend: { display: false }
        },
        maintainAspectRatio: false,
        responsive: true
    };
    public lineChartType: ChartType = 'line';
    async updateRevenueChart() {
        const res = await this.withTimeout(this.productosService.getRevenueStats(this.periodoSeleccionado), 8000);
        this.lineChartData.labels = res.labels.map(label => this.getRevenueLabel(label));
        this.lineChartData.datasets[0].data = res.data;
        this.updateAllCharts();
    }
    refreshPage() {
        globalThis.location.reload();
    }
    get hasRevenueData(): boolean {
        const values = this.lineChartData.datasets[0]?.data as number[] | undefined;
        return !!values?.length && values.some(value => value > 0);
    }
    get hasTopProductsData(): boolean {
        const values = this.barChartData.datasets[0]?.data as number[] | undefined;
        return !!values?.length && values.some(value => value > 0);
    }
    private getRevenueLabel(label: string): string {
        const weekdayLabels: Record<string, string> = {
            MON: 'ADMIN.WEEKDAY_MON',
            TUE: 'ADMIN.WEEKDAY_TUE',
            WED: 'ADMIN.WEEKDAY_WED',
            THU: 'ADMIN.WEEKDAY_THU',
            FRI: 'ADMIN.WEEKDAY_FRI',
            SAT: 'ADMIN.WEEKDAY_SAT',
            SUN: 'ADMIN.WEEKDAY_SUN'
        };
        if (weekdayLabels[label]) {
            return this.languageService.instant(weekdayLabels[label]);
        }
        if (label.startsWith('WEEK_')) {
            const index = Number(label.split('_')[1]);
            return this.languageService.instant('ADMIN.WEEK_LABEL', { index });
        }
        return label;
    }
    public barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            {
                data: [],
                label: this.languageService.instant('ADMIN.UNITS_SOLD_LABEL'),
                backgroundColor: [
                    '#0ea5e9',
                    '#38bdf8',
                    '#7dd3fc',
                    '#bae6fd'
                ],
                borderRadius: 4
            }
        ]
    };
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { weight: 'bold' } }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };
    public barChartType: ChartType = 'bar';
    cerrarSesion() {
        this.router.navigate(['/login']);
    }
    reabastecer(productId: number) {
        this.router.navigate(['/productos-admin'], { queryParams: { restock: productId } });
    }
    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const timeoutPromise = new Promise<T>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Dashboard request timeout')), timeoutMs);
        });
        try {
            return await Promise.race([promise, timeoutPromise]);
        }
        finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }
    private updateAllCharts() {
        this.charts?.forEach(chart => chart.update());
    }
    private applyCurrentThemeToCharts() {
        this.updateChartColors();
    }
}