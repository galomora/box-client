import { Injectable } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http, Response } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/from';

import { BoxAppConfig } from './box.app.config';
import { BoxAuthInfo } from './box.auth.info';

@Injectable()
export class BoxLoginService {

  static BOX_LOGIN_URL = 'https://account.box.com/api/oauth2/authorize';
  static BOX_AUTH_URL = 'https://api.box.com/oauth2/token';
  static USER_TOKEN = 'USER_TOKEN';
  static LOGIN_TOKEN = 'LOGIN_TOKEN';
  static TIME_SET = 'TIME_SET';
  static EXPIRE_IN_SECONDS = 'EXPIRE_IN_SECONDS';
    

  constructor(private cookieService: CookieService, private http: Http) { }

  getAuthorizationInfo (userToken: String, boxAppConfig: BoxAppConfig) : Observable<BoxAuthInfo> {
    let body = this.createAuthParams(userToken, boxAppConfig);
    let htmlResponse = this.
      http.post(BoxLoginService.BOX_AUTH_URL, body);
    return htmlResponse.map(response => this.mapBoxAuthInfo(response)).catch(this.handleError);
  }

  private createAuthParams(userToken: String, boxAppConfig: BoxAppConfig): String {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'authorization_code');
    urlSearchParams.append('code', userToken.toString());
    urlSearchParams.append('client_id', boxAppConfig.clientID.toString());
    urlSearchParams.append('client_secret', boxAppConfig.clientSecret.toString());
    return urlSearchParams.toString();
  }

  private extractData(res: Response) {
    let body = res.json();
    // TODO ver si es mejor con este objeto
    return body.data || {};
  }
  
  private mapBoxAuthInfo (response: Response) {
    let authInfo: BoxAuthInfo = new BoxAuthInfo();
    let jsonResponse = response.json();
    // obtener config de aplicacion box
    authInfo.accessToken = jsonResponse.access_token;
    authInfo.expiresIn = jsonResponse.expires_in;
    authInfo.restrictedTo = jsonResponse.restricted_to;
    authInfo.tokenType = jsonResponse.token_type;
    authInfo.refreshToken = jsonResponse.refresh_token;
    return authInfo;
  }

  private mapConfig(response: Response) {
    let config: BoxAppConfig = new BoxAppConfig();
    let jsonResponse = response.json();
    // obtener config de aplicacion box
    config.clientID = jsonResponse.boxAppSettings.clientID;
    config.clientSecret = jsonResponse.boxAppSettings.clientSecret;
    config.enterpriseID = jsonResponse.enterpriseID;
    config.appAuth.passphrase = jsonResponse.boxAppSettings.appAuth.passphrase;
    config.appAuth.publicKeyID = jsonResponse.boxAppSettings.appAuth.publicKeyID;
    config.appAuth.privateKey = jsonResponse.boxAppSettings.appAuth.privateKey;
    return config;
  }

  getBoxAppConfig(): Observable<any> {
    return this.http.get('assets/config.box.json')
      .map(response => this.mapConfig(response)).catch(this.handleError);
  }

  private handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  private createBoxAccessParams(boxAppConfig: BoxAppConfig): String {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('response_type', 'code');
    urlSearchParams.append('client_id', boxAppConfig.clientID.toString());
    return urlSearchParams.toString();
  }

  generateBoxLoginURL(boxAppConfig: BoxAppConfig): string {
    return BoxLoginService.BOX_LOGIN_URL + '?' + this.createBoxAccessParams(boxAppConfig);
  }
  
  isLoggedIn () : boolean {
    let token = this.cookieService.get(BoxLoginService.USER_TOKEN);
//    TODO verificar expiracion
    return (! (token === undefined));
  }
  
  isnewLogin (newToken : string) {
    let lastLoginToken = this.getLastLoginToken ();
    if (lastLoginToken === undefined) {
      return true;
    } else {
      if (lastLoginToken === newToken) {
        return false;
      }
      else {
        return true;
      }
    }
  }

  setAuthInfoCookie(authInfo : BoxAuthInfo) {
    this.setCookieString (BoxLoginService.USER_TOKEN, authInfo.accessToken);
      let currentDate : Date = new Date ();
      let currentMillis : number = currentDate.getTime ();
    this.setCookieObject (BoxLoginService.TIME_SET, currentMillis);
    this.setCookieObject (BoxLoginService.EXPIRE_IN_SECONDS, authInfo.expiresIn);
  }
  
  setLoginTokenCookie (loginToken : string) {
    this.setCookieString (BoxLoginService.LOGIN_TOKEN, loginToken);
  }
  
  setCookieString(key : string, value: string) {
    this.cookieService.set(key, value);
  }
    
  setCookieObject(key : string, value: any) {
    this.cookieService.set(key, value);
  }
  
  getLastLoginToken () : string {
    return this.cookieService.get(BoxLoginService.LOGIN_TOKEN);
  }
  
  getUserToken () : string {
    return this.cookieService.get(BoxLoginService.USER_TOKEN);
  }
    
  getMinutesToExpire () : number {
      let startTime : Date = new Date ( Number (this.cookieService.get(BoxLoginService.TIME_SET))); 
      if (startTime === undefined || startTime === null) { return 0; }
      let secsToExpire : number = Number (this.cookieService.get(BoxLoginService.EXPIRE_IN_SECONDS));
      let expireTime : Date = new Date (startTime.getTime () + (secsToExpire * 1000));
      let currentDate : Date  = new Date (); 
      if (expireTime.getTime () < currentDate.getTime ()) { return -1;}
      let minutesLeft : number = (expireTime.getTime () - currentDate.getTime ()) / 60000;
      return Number (minutesLeft.toFixed ());
  }
   
  getMinutesExpireObservable () : Observable<number> {
//      el valor se obtiene cada minuto
      return Observable.create (observer => {
          setInterval (() => {
              observer.next (this.getMinutesToExpire ());
              }, 60000);
          });
  }
  
}
