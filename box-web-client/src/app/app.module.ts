import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; //  NgModel lives here
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';

import { RootComponent } from './root.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { UserFilesComponent } from './user.files.component';
import { UserProjectsComponent } from './user.projects.component';
import { ErrorManagerService } from './error.manager.service';

const appRoutes: Routes = [
  { path: 'loggedin', component: LoginComponent },
  { path: '', component: AppComponent }
];

@NgModule({
  declarations: [
    RootComponent,
    AppComponent,
    LoginComponent,
    UserFilesComponent,
    UserProjectsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // debugging purposes only
    )
  ],
  providers: [CookieService, ErrorManagerService],
  bootstrap: [RootComponent]
})
export class AppModule { }