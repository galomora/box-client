import { Injectable } from '@angular/core';

import * as BoxSDKNode from 'box-node-sdk';

import { BoxLoginService } from './box.login.service';
import { BoxAppConfig } from './box.app.config';


@Injectable()
export class BoxClientService {
        
    constructor(private boxLoginService: BoxLoginService) { }
	
	getClient (appConfig: BoxAppConfig) : any {
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
        let userToken = this.boxLoginService.getUserToken();
        let client = boxSDK.getBasicClient(userToken);
        return client;
	} 
}