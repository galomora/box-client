import { BoxAppConfig } from './box.app.config';
import { SessionService } from './session.service';
import { Injectable } from '@angular/core';
import * as BoxSDKNode from 'box-node-sdk';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';

@Injectable()
export class UserService {

    constructor(private sessionService: SessionService) { }

    getUser(appConfig: BoxAppConfig) : Observable<any> {
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
        let userToken = this.sessionService.getUserToken();
        let client = boxSDK.getBasicClient(userToken);
        let userPromise = client.users.get(client.CURRENT_USER_ID);
        return Observable.fromPromise (userPromise);
    }

}