import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; //  NgModel lives here
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CookieService } from 'ngx-cookie-service';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { RootComponent } from './root.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { UserFilesComponent } from './user.files.component';
import { UserProjectsComponent } from './user.projects.component';
import { ErrorManagerService } from './error.manager.service';
import { RoutingModule } from './routing.module';
import { SessionService } from './session.service';
import { BoxLoginService } from './box.login.service';
import { BoxAppService } from './box.app.service';

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
    RoutingModule,
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [CookieService, ErrorManagerService, SessionService, BoxLoginService, BoxAppService],
  bootstrap: [RootComponent]
})
export class AppModule { }