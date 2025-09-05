import { Component, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatMenuTrigger } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatMenuPanel } from '@angular/material/menu';  // Import MatMenuPanel
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';

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
export class ProductPageComponent implements AfterViewInit {
  constructor(private router: Router) { }

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  isDarkMode = false;

  // Define the categories with their respective subcategories and menu triggers
  categories: Category[] = [
    { name: 'Stocks', icon: 'trending_up', subcategories: ['Gaming', 'Ultrabooks', '2-in-1'], menu: null },
    { name: 'Gold', icon: 'attach_money', subcategories: ['Flagship', 'Mid-range', 'Budget'], menu: null },
    { name: 'Mutual funds', icon: 'equalizer', subcategories: ['iOS', 'Android'], menu: null }
  ];

  // Function to toggle dark mode and store in localStorage
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
  }

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
  }

  ngAfterViewInit() {
    // Assign MatMenuTriggers to each category's menu property and cast it to MatMenuPanel<any>
    this.menuTriggers.toArray().forEach((menuTrigger, index) => {
      this.categories[index].menu = menuTrigger.menu as MatMenuPanel<any>;
    });
  }
  openSettings() {
    console.log('Settings button clicked');
    // Implement your settings functionality here
  }
  goTo() {
    console.log("CLICKED")
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
  Highcharts: typeof Highcharts = Highcharts;

  goldChartOptions: Highcharts.Options = {
    title: { text: 'Gold Prices (2025)' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June','July','August','September'] },
    yAxis: { title: { text: 'Price (USD/oz)' } },
    series: [{
      type: 'line',
      name: 'Gold',
      data: [1900, 1925, 1890, 1950, 1980,1983]
    }],
    responsive: {
      rules: [{
        condition: { maxWidth: 200 },
        chartOptions: {
          legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' }
        }
      }]
    }
  };

  stockChartOptions: Highcharts.Options = {
    title: { text: 'Stock Market Index (2025)' },
    xAxis: { categories:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June','July','August','September'] },
    yAxis: { title: { text: 'Index Value' } },
    series: [{
      type: 'line',
      name: 'S&P 500',
      data: [4700, 4750, 4600, 4800, 4900, 5000]
    },
    {
      type: 'line',
      name: 'Nasdaq',
      data: [6565, 4444, 2800, 3600, 5300]
    },
    {
      type: 'line',
      name: 'Shanghai Stock Exchange',
      data: [5000, 4300, 7000, 2590, 6200]
    },
    {
      type: 'line',
      name: 'Japan Exchange group',
      data: [4700, 4750, 4600, 3900, 5235]
    },
    {
      type: 'line',
      name: 'National Stock Exchange(IND)',
      data: [5700, 6750, 3600, 5800, 7900]
    },
    ],
    responsive: {
      rules: [{
        condition: { maxWidth: 200 },
        chartOptions: {
          legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' }
        }
      }]
    }
  };

  mutualFundChartOptions: Highcharts.Options = {
    title: { text: 'Mutual Fund Returns (2025)' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June','July','August','September']},
    yAxis: { title: { text: 'NAV (USD)' } },
    series: [{
      type: 'line',
      name: 'Fund A',
      data: [100, 102, 101, 104, 107,109]
    },
    {
      type: 'line',
      name: 'Fund B',
      data: [99, 108, 121, 165, 113]
    },
    {
      type: 'line',
      name: 'Fund C',
      data: [85, 108, 101, 115, 126]
    },
    {
      type: 'line',
      name: 'Fund D',
      data: [95, 79, 76, 122, 106]
    }],
    responsive: {
      rules: [{
        condition: { maxWidth: 200 },
        chartOptions: {
          legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' }
        }
      }]
    }
  };

}

interface Category {
  name: string;
  icon: string;
  subcategories: string[];
  menu: MatMenuPanel<any> | null;  // MatMenuPanel to handle the submenus
}
