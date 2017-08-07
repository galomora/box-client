import { Component, OnInit } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http } from '@angular/http';

import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map' // map
import { BoxAppConfig } from './box.app.config';
import { BoxLoginService } from './box.login.service';
import { UserService } from './user.service';
import { UserFilesService } from './user.files.service';
import { BoxClientService } from './box.client.service';
import { UserElement } from './user.element';
import { BoxItemInfo } from './box.item.info';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./app.component.css'],
    providers: [BoxLoginService, UserService, UserFilesService, BoxClientService]
})

export class LoginComponent implements OnInit {

    userLoginToken: string;
    loginStatus: string;
    errorMessage: string;
    boxAppConfig: BoxAppConfig;
    showError: boolean = false;
    userName: string;
    
    projectFolders : Array<BoxItemInfo> = [];

    constructor(private boxLoginService: BoxLoginService,
        private userService: UserService,
        private userFilesService: UserFilesService,
        private route: ActivatedRoute,
        private boxClientService: BoxClientService) {
    }

    ngOnInit(): void {

        // obtener token param de http

        this.userLoginToken = this.route.snapshot.queryParams['code'];
        if (this.userLoginToken === undefined) {
            // no hay token, no login
            console.log('no hay token, no login');
        } else {
            if (this.boxLoginService.isnewLogin(this.userLoginToken)) {
                // nuevo token, se hace login
                console.log('nuevo token, se hace login');
                this.executeLoginToBox();
            } else {
                console.log('no se debe hacer login con el mismo token anterior');
                // no se debe hacer login con el mismo token anterior
                this.getUserInfo();
                this.getProjects ();
            }
        }
    }

    private executeLoginToBox() {
        this.boxLoginService.getBoxAppConfig().subscribe(
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
        let loggedUserToken: string;
        this.boxLoginService.getAuthorizationInfo(this.userLoginToken, this.boxAppConfig).subscribe(
            authInfo => {
                loggedUserToken = authInfo.accessToken;
                this.boxLoginService.setUserCookie(loggedUserToken);
                this.boxLoginService.setLoginTokenCookie(this.userLoginToken);
                this.getUserInfo();
                this.getProjects ();
            },
            error => {
                this.displayError (error, 'Error obtener autenticacion');
            }
        );
    }

    private getUserInfo() {
        this.boxLoginService.getBoxAppConfig().subscribe(
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
        if (!this.boxLoginService.isLoggedIn()) { return; }
        this.userService.getUser(this.boxAppConfig).subscribe(
            userInfo => {
                console.log(' usuario ' + userInfo.name);
                this.userName = userInfo.name;
            },
            error => {
                this.displayError (error, 'Error obtener info de usuario');
            }
        );
    }

    
    private getProjects() {
        this.projectFolders = [];
        this.boxLoginService.getBoxAppConfig().subscribe(
            boxConfig => {
                this.boxAppConfig = boxConfig;
                let boxClient = this.boxClientService.getClient(this.boxAppConfig);
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
        this.showError = true;
    }
}
