import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BoxLoginService } from './box.login.service';
import { BoxAppService } from './box.app.service';
import { BoxAppConfig } from './box.app.config';
import { SessionService } from './session.service';



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
  private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.showError = false;
    this.logoutParam = this.route.snapshot.queryParams['logout'];
      console.log (this.logoutParam + this.sessionService.isLoggedIn());
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
            },
            error => {
                this.displayError(error, 'Error closing session');
            }
        );
    }

    private displayError (error : any, message:string) {
        this.errorMessage = error.toString();
        this.showError = true;
        console.log(message + ' ' + error.toString());
    }
    
}

