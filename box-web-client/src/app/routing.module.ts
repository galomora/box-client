import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';


const appRoutes: Routes = [
    { path: 'init', component: AppComponent },
  { path: 'loggedin', component: LoginComponent },
  { path: '', redirectTo: '/init', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // debugging purposes only
    )
  ],
  exports: [RouterModule]
})
export class RoutingModule { }