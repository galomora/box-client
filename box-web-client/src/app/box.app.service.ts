import { Injectable } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http, Response } from '@angular/http';
import * as BoxSDKNode from 'box-node-sdk';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';

import { BoxAppConfig } from './box.app.config';
import { BoxLoginService } from './box.login.service';
import { ErrorManagerService } from './error.manager.service';
import { SessionService } from './session.service';

@Injectable()
export class BoxAppService {

    constructor(private http: Http, private errorManagerService: ErrorManagerService,
        private sessionService: SessionService) { }

    getBoxAppConfig(): Observable<BoxAppConfig> {
        return this.http.get('assets/config.box.json')
            .map(response => this.mapConfig(response)).catch(this.errorManagerService.handleErrorObservable);
    }

    private mapConfig(response: Response): BoxAppConfig {
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
    
    getBoxSDKFromConfig(): Observable<BoxSDKNode> {
        return Observable.create(observer => {
            this.getBoxAppConfig().subscribe(
                boxConfig => {
                    observer.next(this.getBoxSDK(boxConfig));
                }, error => {
                    observer.error(error);
                }
            );
        });
    }
    
    getBoxSDK(appConfig: BoxAppConfig): BoxSDKNode {
        let boxSDK = new BoxSDKNode({
            clientID: appConfig.clientID,
            clientSecret: appConfig.clientSecret,
            appAuth: {
                keyID: appConfig.appAuth.publicKeyID,
                privateKey: appConfig.appAuth.privateKey,
                passphrase: appConfig.appAuth.passphrase
            }
        }
        );
        return boxSDK;
    }
    
    private testSDK (boxSDK : BoxSDKNode) {
//        TODO mover test
//         OAuth con sdk no soporta promises TOO BAD ;__;
//        console.log ('init test');
//        boxSDK.getTokensRefreshGrant ('asdfasdfasdf').then (
//            response => console.log (JSON.stringify (response))
//            ).catch (
//                error => console.log (JSON.stringify (error))
//                );
        boxSDK.getTokensRefreshGrant('asdfasdfasdf', function(error, tokenInfo) {
            console.log(JSON.stringify(tokenInfo));
            console.log(JSON.stringify(error));
        });
    }

    getClient(appConfig: BoxAppConfig): any {
        let boxSDK = this.getBoxSDK (appConfig);
        let userToken = this.sessionService.getUserToken();
        let client = boxSDK.getBasicClient(userToken);
        return client;
    }

    getClientFromConfig(): Observable<any> {
//        let observableClient : Observable<any> ;
//        
//        this.getBoxAppConfig().subscribe(
//            boxConfig => {
//                observableClient = Observable.create(observer => {
//                    observer.next(this.getClient (boxConfig));
//                });
//            },
//            error => {
//                return this.errorManagerService.handleErrorObservable
//            }
//        );
//        return observableClient;
        return Observable.create(observer => {
            this.getBoxAppConfig().subscribe(
                boxConfig => {
                    observer.next(this.getClient(boxConfig));
                }, error => {
                    observer.error(error);
                }
            );
        });
    }
}
