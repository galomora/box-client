import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {NotificationsService} from 'angular2-notifications';

import { BoxLoginService } from './box.login.service';
import { BoxAppService } from './box.app.service';
import { BoxAppConfig } from './box.app.config';
import { SessionService } from './session.service';
import { NotificationOptions } from './notification.options';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoxAppService]
})
export class AppComponent implements OnInit {
  boxLoginURL: string;
  config: BoxAppConfig = new BoxAppConfig();
  errorMessage: string;
  infoMessage: string;
  showError : boolean = false;
  linkGenerated : boolean = false;
  logoutParam: string;

  constructor(private boxLoginService: BoxLoginService, 
  private boxAppService: BoxAppService,
  private route: ActivatedRoute,
  private sessionService: SessionService,
  private notificationsService : NotificationsService    
      ) {
  }

  ngOnInit(): void {
    this.showError = false;
    this.logoutParam = this.route.snapshot.queryParams['logout'];
    if (this.logoutParam !== undefined && this.logoutParam === 'true' && this.sessionService.isLoggedIn()) {
        this.closeSession();
    }
    this.generateLoginBoxLink ();
  }
    
  private generateLoginBoxLink() {
      this.boxAppService.getBoxAppConfig().subscribe(
          boxConfig => {
              this.config = boxConfig;
              this.boxLoginURL = this.boxLoginService.generateBoxLoginURL(boxConfig);
              this.linkGenerated = true;
          },
          error => {
              this.displayError(error, 'Error obtener config app');
              this.linkGenerated = false;
          }
      );
  }
    
    closeSession() {
        this.boxLoginService.closeSession().subscribe(
            (logoutInfo : string) => {
                this.sessionService.removeSessionCookies ();
                this.infoMessage = 'Session Finished ' + (logoutInfo === undefined ? '': (': ' + logoutInfo));
                this.notificationsService.info ('Session Finished', logoutInfo, NotificationOptions.options);
            },
            error => {
                this.displayError(error, 'Error closing session');
            }
        );
    }

    private displayError (error : any, message:string) {
        this.errorMessage = error.toString();
        this.showError = true;
        this.notificationsService.error ('Error', error.toString(), NotificationOptions.options);
        console.log(message + ' ' + error.toString());
    }
    
}

