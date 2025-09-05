import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './account/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './user/home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { MaterialModule } from './material.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { AccountModule } from './account/account.module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HighchartsChartModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
