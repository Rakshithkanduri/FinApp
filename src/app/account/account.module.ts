import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { HttpClientModule } from '@angular/common/http';
import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../material.module';



@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AccountRoutingModule,
    MaterialModule
    // ToastrModule.forRoot({
    //   closeButton: true,
    //   timeOut: 15000, // 15 seconds
    //   progressBar: true,
    // }),
  ]
})
export class AccountModule { }
