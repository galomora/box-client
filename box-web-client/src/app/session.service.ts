
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import * as BoxSDKNode from 'box-node-sdk';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';

import { BoxAppConfig } from './box.app.config';
import { BoxAuthInfo } from './box.auth.info';
import { BoxRefreshInfo } from './box.refresh.info';
import { BoxLoginService } from './box.login.service';

@Injectable()
export class SessionService {

    static USER_TOKEN = 'USER_TOKEN';
    static LOGIN_TOKEN = 'LOGIN_TOKEN';
    static TIME_SET = 'TIME_SET';
    static EXPIRE_IN_SECONDS = 'EXPIRE_IN_SECONDS';
    static REFRESH_TOKEN = 'REFRESH_TOKEN';

    constructor(private cookieService: CookieService) { }

    setAuthInfoCookie(authInfo: BoxAuthInfo) {
        this.setCookieString(SessionService.USER_TOKEN, authInfo.accessToken);
        this.setCookieObject(SessionService.TIME_SET, this.getCurrentTimeMillis ());
        this.setCookieObject(SessionService.EXPIRE_IN_SECONDS, authInfo.expiresIn);
        this.setCookieString(SessionService.REFRESH_TOKEN, authInfo.refreshToken);
    }
    
    getAuthInfoCookie(): BoxAuthInfo {
        let authInfo: BoxAuthInfo = new BoxAuthInfo();
        authInfo.accessToken = this.cookieService.get(SessionService.USER_TOKEN);
        authInfo.refreshToken = this.cookieService.get(SessionService.REFRESH_TOKEN);
        authInfo.expiresIn = Number(this.cookieService.get(SessionService.EXPIRE_IN_SECONDS));
        return authInfo;
    }

    setCookieString(key: string, value: string) {
        this.cookieService.set(key, value);
    }

    setCookieObject(key: string, value: any) {
        this.cookieService.set(key, value);
    }

    isLoggedIn(): boolean {
        let token = this.cookieService.get(SessionService.USER_TOKEN);
        //            TODO verificar expiracion
        return (!(token === undefined));
    }

    setLoginTokenCookie(loginToken: string) {
        this.setCookieString(SessionService.LOGIN_TOKEN, loginToken);
    }
    
    getLastLoginToken(): string {
        return this.cookieService.get(SessionService.LOGIN_TOKEN);
    }

    getUserToken(): string {
        return this.cookieService.get(SessionService.USER_TOKEN);
    }

    getMinutesToExpire(): number {
        let startTime: Date = new Date(Number(this.cookieService.get(SessionService.TIME_SET)));
        if (startTime === undefined || startTime === null) { return 0; }
        let secsToExpire: number = Number(this.cookieService.get(SessionService.EXPIRE_IN_SECONDS));
        let expireTime: Date = new Date(startTime.getTime() + (secsToExpire * 1000));
        let currentDate: Date = new Date();
        if (expireTime.getTime() < currentDate.getTime()) { return -1; }
        let minutesLeft: number = (expireTime.getTime() - currentDate.getTime()) / 60000;
        return Number(minutesLeft.toFixed());
    }

    getMinutesExpireObservable(): Observable<number> {
        //      el valor se obtiene cada minuto = 60000
        return Observable.create(observer => {
            setInterval(() => {
                observer.next(this.getMinutesToExpire());
            }, 10000);
        });
    }
    
    refreshSessionCookie (boxRefreshInfo : BoxRefreshInfo) {
        this.setCookieString(SessionService.USER_TOKEN, boxRefreshInfo.accessToken);
        this.setCookieObject(SessionService.TIME_SET, this.getCurrentTimeMillis ());
        this.setCookieObject(SessionService.EXPIRE_IN_SECONDS, this.getSecondsFromMillis (boxRefreshInfo.accessTokenTTLMS));
        this.setCookieString(SessionService.REFRESH_TOKEN, boxRefreshInfo.refreshToken);
    }
    
    removeSessionCookies () {
        this.cookieService.delete (SessionService.USER_TOKEN);
        this.cookieService.delete (SessionService.TIME_SET);
        this.cookieService.delete (SessionService.EXPIRE_IN_SECONDS);
        this.cookieService.delete (SessionService.REFRESH_TOKEN);
        
    }
    
    private getCurrentTimeMillis(): number {
        let currentDate: Date = new Date();
        let currentMillis: number = currentDate.getTime();
        return currentMillis
    }
    
    private getSecondsFromMillis (millis: number) {
        return Number((millis / 1000).toFixed());    
    }

}