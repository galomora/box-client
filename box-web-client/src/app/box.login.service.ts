import { Injectable } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/from';

import { BoxAppConfig } from './box.app.config';
import { BoxAuthInfo } from './box.auth.info';
import { BoxRefreshInfo } from './box.refresh.info';
import { ErrorManagerService } from './error.manager.service';
import { SessionService } from './session.service';
import { BoxAppService } from './box.app.service';


@Injectable()
export class BoxLoginService {

  static BOX_LOGIN_URL = 'https://account.box.com/api/oauth2/authorize';
  static BOX_AUTH_URL = 'https://api.box.com/oauth2/token';
  
    

  constructor(private http: Http, 
    private errorManagerService : ErrorManagerService,
    private sessionService : SessionService, 
    private boxAppService : BoxAppService) { }

  getAuthorizationInfo (userToken: String, boxAppConfig: BoxAppConfig) : Observable<BoxAuthInfo> {
    let body = this.createAuthParams(userToken, boxAppConfig);
    let htmlResponse = this.
      http.post(BoxLoginService.BOX_AUTH_URL, body);
    return htmlResponse.map(response => this.mapBoxAuthInfo(response)).catch(this.errorManagerService.handleErrorObservable);
  }

  private createAuthParams(userToken: String, boxAppConfig: BoxAppConfig): String {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'authorization_code');
    urlSearchParams.append('code', userToken.toString());
    urlSearchParams.append('client_id', boxAppConfig.clientID.toString());
    urlSearchParams.append('client_secret', boxAppConfig.clientSecret.toString());
    return urlSearchParams.toString();
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

  private createBoxAccessParams(boxAppConfig: BoxAppConfig): String {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('response_type', 'code');
    urlSearchParams.append('client_id', boxAppConfig.clientID.toString());
    return urlSearchParams.toString();
  }

  generateBoxLoginURL(boxAppConfig: BoxAppConfig): string {
    return BoxLoginService.BOX_LOGIN_URL + '?' + this.createBoxAccessParams(boxAppConfig);
  }
  
  isnewLogin (newToken : string) {
    
      //TODO quitar session service??
    
    let lastLoginToken = this.sessionService.getLastLoginToken ();
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
    
  refreshSession() : Observable<BoxRefreshInfo> {
      return Observable.create(observer => {
          this.boxAppService.getBoxSDKFromConfig().subscribe(
              boxSDK => {
                  this.sendRefreshToken(boxSDK, this.sessionService.getAuthInfoCookie().refreshToken).subscribe(
                      response => {
                          observer.next (response);
                      },
                      error => {
                          observer.error (error);
                      }
                  );
              },
              error => {
                  observer.error (error);
              }
          );
      }); //end create
  }
    
  sendRefreshToken(boxSDK: any, refreshToken: string): Observable<BoxRefreshInfo> {
      return Observable.create(observer => {
          boxSDK.getTokensRefreshGrant(refreshToken, function(error, tokenInfo) {
              if (error) {
                  observer.error (error);
              } else {
                  let refreshInfo: BoxRefreshInfo = BoxLoginService.mapBoxRefreshInfo (tokenInfo); 
                observer.next (refreshInfo);    
              }
          });
      });
  }
    
  private static mapBoxRefreshInfo(response: any) : BoxRefreshInfo {
      let refreshInfo: BoxRefreshInfo = new BoxRefreshInfo();
      // obtener config de aplicacion box
      refreshInfo.accessToken = response.accessToken;
      refreshInfo.refreshToken = response.refreshToken;
      refreshInfo.accessTokenTTLMS = response.accessTokenTTLMS;
      refreshInfo.acquiredAtMS = response.acquiredAtMS;
      return refreshInfo;
  }
    
  closeSession () : Observable<string> {
      return Observable.create(observer => {
      this.boxAppService.getBoxSDKFromConfig().subscribe(
              boxSDK => {
                  this.sendEndSession(boxSDK, this.sessionService.getAuthInfoCookie().accessToken).subscribe(
                      response => {
                          console.log ('se cerro ' + response);
                          this.sessionService.removeSessionCookies ();
                          observer.next (response);
                      },
                      error => {
                          observer.error (error);
                      }
                  );
              },
              error => {
                  observer.error (error);
              }
          );
      });
  }
    
  sendEndSession(boxSDK: any, userToken: string): Observable<string> {
      console.log ('el token ' + userToken);
//      TODO no funciona revokeTokens, falla, but why??
//      queda comentado hasta determinar el problema
//      https://github.com/box/box-node-sdk#revoking-tokens
//      return Observable.create(observer => {
          boxSDK.revokeTokens(userToken, function(error) {
              if (error) {
//                  observer.error(error);
                  console.log ('error cerrando sesion ' + JSON.stringify ( error));
              } else {
//                  observer.next('Session was closed');
              }
          });
//      });
      
      return Observable.create(observer => {
          observer.next ('Session was closed');
          });
  }
     
}
