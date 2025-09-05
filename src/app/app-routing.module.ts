import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductPageComponent } from './product-page/product-page.component';
//import { AuthGuard } from './helpers/auth-guard.service';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'product-page',
    pathMatch: 'full'
  },
  {
    path: 'product-page',
    component: ProductPageComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/account/account.module')
      .then(m => m.AccountModule)
  },
  {
    path: '**',
    redirectTo: 'product-page'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
