import { Component, OnInit } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map' // map
import { NotificationsService } from 'angular2-notifications';

import { BoxAppConfig } from './box.app.config';
import { BoxLoginService } from './box.login.service';
import { UserService } from './user.service';
import { UserFilesService } from './user.files.service';
import { BoxAppService } from './box.app.service';
import { SessionService } from './session.service';
import { UserElement } from './user.element';
import { BoxItemInfo } from './box.item.info';
import { BoxAuthInfo } from './box.auth.info';
import { BoxRefreshInfo } from './box.refresh.info';
import { NotificationOptions } from './notification.options';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [BoxLoginService, UserService, UserFilesService, BoxAppService, SessionService]
})

export class LoginComponent implements OnInit {

    userLoginToken: string;
    loginStatus: string;
    errorMessage: string;
    boxAppConfig: BoxAppConfig;
    showError: boolean = false;
    userName: string;
    minutesToExpire : number;
    
    projectFolders : Array<BoxItemInfo> = [];

    constructor(private boxLoginService: BoxLoginService,
        private userService: UserService,
        private userFilesService: UserFilesService,
        private route: ActivatedRoute,
        private boxAppService: BoxAppService, 
        private sessionService: SessionService,
        private notificationsService : NotificationsService) {
    }

    ngOnInit(): void {

        // obtener token param de http

        this.userLoginToken = this.route.snapshot.queryParams['code'];
        if (this.userLoginToken === undefined) {
            // no hay token, no login
        } else {
            if (this.boxLoginService.isnewLogin(this.userLoginToken)) {
                // nuevo token, se hace login
                this.executeLoginToBox();
            } else {
                // no se debe hacer login con el mismo token anterior
                this.getUserInfo();
                this.getProjects ();
            }
        }
        this.getExpireTimeEachMinute ();
        
    }

    private executeLoginToBox() {
        this.sessionService.removeSessionCookies ();
        this.boxAppService.getBoxAppConfig().subscribe(
            boxConfig => {
                this.boxAppConfig = boxConfig;
                this.getAuthorization();
            },
            error => {
                this.displayError (error, 'Error obtener configuracion');
            }
        );
    }

    private getAuthorization() {
//        let loggedUserToken: string;
        this.boxLoginService.getAuthorizationInfo(this.userLoginToken, this.boxAppConfig).subscribe(
            (authInfo : BoxAuthInfo) => {
                this.sessionService.setAuthInfoCookie(authInfo);
                this.sessionService.setLoginTokenCookie(this.userLoginToken);
                this.getUserInfo();
                this.getProjects ();
            },
            error => {
                this.displayError (error, 'Error obtener autenticacion');
            }
        );
    }

    private getUserInfo() {
        this.boxAppService.getBoxAppConfig().subscribe(
            boxConfig => {
                this.boxAppConfig = boxConfig;
                this.getBoxUser();
            },
            error => {
                this.displayError (error, 'Error obtener configuracion');
            }
        );

    }

    private getBoxUser() {
        if (!this.sessionService.isLoggedIn()) { return; }
        this.userService.getUser(this.boxAppConfig).subscribe(
            userInfo => {
                this.userName = userInfo.name;
            },
            error => {
                this.displayError (error, 'Error obtener info de usuario');
            }
        );
    }

    
    private getProjects() {
        this.projectFolders = [];
        this.boxAppService.getBoxAppConfig().subscribe(
            boxConfig => {
                this.boxAppConfig = boxConfig;
                let boxClient = this.boxAppService.getClient(this.boxAppConfig);
                this.userFilesService.getProjectFolders(boxClient, this.projectFolders);
            },
            error => {
                this.displayError (error, 'Error obtener configuracion');
            }
        );
    }
    
    private displayError(error: any, errorMessage: string) {
        this.errorMessage = error.toString();
        console.log(errorMessage + ' ' + error.toString());
        this.notificationsService.error ('Error', error.toString(), NotificationOptions.options);
        this.showError = true;
    }
    
    private getExpireTimeEachMinute() {
        this.sessionService.getMinutesExpireObservable().subscribe(
            time => this.minutesToExpire = time);
    }

    refreshSession() {
        this.boxLoginService.refreshSession().subscribe(
            (refreshInfo : BoxRefreshInfo) => {
                this.sessionService.refreshSessionCookie (refreshInfo);
                this.notificationsService.error ('Session', 'Session was refreshed', NotificationOptions.options);
            },
            error => {
                this.displayError (error, 'Error actualizar sesion');
            }
        );
    }
    
}
