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

  // Debug holders
  stockApiResponse: any = null;
  goldApiResponse: any = null;

  // ---------------- STOCK Chart ----------------
  stockChartOptions: Highcharts.Options = {
    title: { text: 'Stock Market Index (Live)' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Index Value' } },
    series: []
  };
  loadingStocks = true;

  // ---------------- GOLD Chart ----------------
  goldChartOptions: Highcharts.Options = {
    title: { text: 'Gold Price (Today)' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Price (USD/oz)' } },
    series: []
  };
  loadingGold = true;

  // ---------------- GDP Chart ----------------
  gdpChartOptions: Highcharts.Options = {
    title: { text: 'Selected Economies GDP Trend' },
    chart: { type: 'line' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'GDP (Trillions USD)' } },
    series: []
  };
  loadingGDP = true;

  private triedStockDemoFallback = false;

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';

    this.loadStockData();
    this.loadGoldData();
    this.loadGDPData(); // ✅ fetch GDP chart data
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
      this.stockApiResponse = res;

      if (res?.Information || res?.['Error Message'] || !res?.['Time Series (Daily)']) {
        if (!this.triedStockDemoFallback) {
          this.triedStockDemoFallback = true;
          this.requestAlphaVantage('demo');
          return;
        }

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
      this.stockChartOptions = {
        ...this.stockChartOptions,
        xAxis: { categories: ['—'] },
        series: [{ type: 'line', name: 'MSFT', data: [0] }]
      };
      this.loadingStocks = false;
    });
  }

  loadStockData() {
    this.requestAlphaVantage('H75X6YUEV06GA73U');
  }

  // ---------------- GOLD (metals.dev) ----------------
  private extractGoldPrice(res: any): number | null {
    const price = res?.metals?.gold;
    return (typeof price === 'number' && !Number.isNaN(price)) ? price : null;
  }

  loadGoldData() {
    const apiKey = 'J3LFQ0ZGMPVUOFB1ZV71301B1ZV71';
    const url = `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`;

    this.http.get<any>(url).subscribe(res => {
      this.goldApiResponse = res;

      const price = this.extractGoldPrice(res);
      if (price == null) {
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
      this.goldChartOptions = {
        ...this.goldChartOptions,
        xAxis: { categories: ['Today'] },
        series: [{ type: 'column', name: 'Gold (USD/toz)', data: [0] }]
      };
      this.loadingGold = false;
    });
  }

  // ---------------- GDP (World Bank, Selected Countries, Trend) ----------------
  loadGDPData() {
    const url = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?date=2020:2025&format=json&per_page=2000';

    const countryFilter = ['US', 'GB', 'IN', 'CN', 'JP', 'DE', 'FR', 'CA', 'BR', 'IT'];

    this.http.get<any>(url).subscribe(res => {
      const data = res?.[1];
      if (!Array.isArray(data)) {
        this.loadingGDP = false;
        return;
      }

      const validData = data.filter((d: any) => d.value !== null && countryFilter.includes(d.country.id));
      if (!validData.length) {
        this.loadingGDP = false;
        return;
      }

      // Collect available years dynamically
      const years = Array.from(new Set(validData.map((d: any) => d.date))).sort();
      const minYear = years[0];
      const maxYear = years[years.length - 1];
      const seriesData: any[] = [];

      countryFilter.forEach(code => {
        const countryRecords = validData.filter((d: any) => d.country.id === code);
        const sortedByYear = years.map(y => {
          const rec = countryRecords.find((r: any) => r.date === y);
          return rec ? +(rec.value / 1e12).toFixed(2) : null;
        });

        if (countryRecords.length > 0) {
          seriesData.push({
            type: 'line',
            name: countryRecords[0].country.value,
            data: sortedByYear
          });
        }
      });

      this.gdpChartOptions = {
        chart: { type: 'line' },
        title: { text: `GDP Trends (${minYear}–${maxYear})` },
        xAxis: { categories: years },
        yAxis: { title: { text: 'GDP (Trillion USD)' } },
        series: seriesData
      };

      this.loadingGDP = false;
    }, err => {
      console.error('Error fetching GDP data', err);
      this.loadingGDP = false;
    });
  }
}

interface Category {
  name: string;
  icon: string;
  subcategories: string[];
  menu: MatMenuPanel<any> | null;
}
