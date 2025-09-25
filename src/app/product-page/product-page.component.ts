import { Component, ViewChild, AfterViewInit, QueryList, ViewChildren, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatMenuTrigger, MatMenuPanel } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
  animations: [
    trigger('sidenavAnimation', [
      state('void', style({ transform: 'translateX(-100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition('void <=> *', animate('300ms ease-out'))
    ])
  ]
})
export class ProductPageComponent implements AfterViewInit, OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  isDarkMode = false;

  categories: Category[] = [
    { name: 'Stocks', icon: 'trending_up', subcategories: ['Global Indices'], menu: null },
    { name: 'Gold', icon: 'attach_money', subcategories: ['Spot Price'], menu: null }
  ];

  Highcharts: typeof Highcharts = Highcharts;

  // Debug holders (optional: bind in template if needed)
  stockApiResponse: any = null;
  goldApiResponse: any = null;

  // Charts
  stockChartOptions: Highcharts.Options = {
    title: { text: 'Stock Market Index (Live)' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Index Value' } },
    series: []
  };
  loadingStocks = true;

  goldChartOptions: Highcharts.Options = {
    title: { text: 'Gold Price (Today)' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Price (USD/oz)' } },
    series: []
  };
  loadingGold = true;

  private triedStockDemoFallback = false;

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';

    this.loadStockData(); // will fallback to demo if your key is rate-limited
    this.loadGoldData();  // metals.dev mapping fixed here
  }

  ngAfterViewInit() {
    this.menuTriggers.toArray().forEach((menuTrigger, index) => {
      this.categories[index].menu = menuTrigger.menu as MatMenuPanel<any>;
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
  }

  goTo() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  // ---------------- STOCK (Alpha Vantage) ----------------
  private parseAlphaVantageDaily(res: any): { dates: string[]; closes: number[] } | null {
    const daily = res?.['Time Series (Daily)'];
    if (!daily || typeof daily !== 'object') return null;

    const dates = Object.keys(daily).slice(0, 7).reverse();
    const closes = dates.map(d => Number(daily[d]?.['4. close'])).filter(v => !Number.isNaN(v));

    if (!dates.length || !closes.length) return null;
    return { dates, closes };
  }

  private requestAlphaVantage(apikey: string) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=${apikey}`;
    this.http.get<any>(url).subscribe(res => {
      console.log('Stock API Response:', res);
      this.stockApiResponse = res;

      // If rate limited or bad key, AV sends "Information" or "Error Message"
      if (res?.Information || res?.['Error Message'] || !res?.['Time Series (Daily)']) {
        console.warn('AlphaVantage rate-limited or invalid. info:', res?.Information || res?.['Error Message']);

        // Try demo once so you can at least see a chart
        if (!this.triedStockDemoFallback) {
          this.triedStockDemoFallback = true;
          this.requestAlphaVantage('demo'); // MSFT works with demo
          return;
        }

        // Final fallback: placeholder
        this.stockChartOptions = {
          ...this.stockChartOptions,
          xAxis: { categories: ['—'] },
          series: [{ type: 'line', name: 'MSFT', data: [0] }]
        };
        this.loadingStocks = false;
        return;
      }

      const parsed = this.parseAlphaVantageDaily(res);
      if (!parsed) {
        console.error('No stock data parsed.');
        this.stockChartOptions = {
          ...this.stockChartOptions,
          xAxis: { categories: ['—'] },
          series: [{ type: 'line', name: 'MSFT', data: [0] }]
        };
        this.loadingStocks = false;
        return;
      }

      this.stockChartOptions = {
        ...this.stockChartOptions,
        xAxis: { categories: parsed.dates },
        series: [{ type: 'line', name: 'MSFT', data: parsed.closes }]
      };
      this.loadingStocks = false;
    }, err => {
      console.error('Error fetching stock data:', err);
      this.stockChartOptions = {
        ...this.stockChartOptions,
        xAxis: { categories: ['—'] },
        series: [{ type: 'line', name: 'MSFT', data: [0] }]
      };
      this.loadingStocks = false;
    });
  }

  loadStockData() {
    // your real key first; auto-fallback to "demo" if rate-limited
    this.requestAlphaVantage('H75X6YUEV06GA73U');
  }

  // ---------------- GOLD (metals.dev) ----------------
  private extractGoldPrice(res: any): number | null {
    // Your console showed: { status: 'success', unit: 'toz', currency: 'USD', metals: { gold: 3755.91, ... } }
    const price = res?.metals?.gold;
    return (typeof price === 'number' && !Number.isNaN(price)) ? price : null;
  }

  loadGoldData() {
    const apiKey = 'J3LFQ0ZGMPVUOFB1ZV71301B1ZV71';
    const url = `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`;

    this.http.get<any>(url).subscribe(res => {
      console.log('Gold API Response:', res);
      this.goldApiResponse = res;

      const price = this.extractGoldPrice(res);
      if (price == null) {
        console.error('Could not parse gold price from response.');
        this.goldChartOptions = {
          ...this.goldChartOptions,
          xAxis: { categories: ['Today'] },
          series: [{ type: 'column', name: 'Gold (USD/toz)', data: [0] }]
        };
        this.loadingGold = false;
        return;
      }

      const today = new Date().toLocaleDateString();
      this.goldChartOptions = {
        ...this.goldChartOptions,
        xAxis: { categories: [today] },
        series: [{ type: 'column', name: 'Gold (USD/toz)', data: [price] }]
      };
      this.loadingGold = false;
    }, err => {
      console.error('Error fetching gold data:', err);
      this.goldChartOptions = {
        ...this.goldChartOptions,
        xAxis: { categories: ['Today'] },
        series: [{ type: 'column', name: 'Gold (USD/toz)', data: [0] }]
      };
      this.loadingGold = false;
    });
  }
}

interface Category {
  name: string;
  icon: string;
  subcategories: string[];
  menu: MatMenuPanel<any> | null;
}
