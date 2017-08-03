
export class BoxAppConfig {
  clientID : String;
  clientSecret : String;
  enterpriseID : String;
  appAuth : {
    publicKeyID : string;
    privateKey: string;
    passphrase: string;
  };

  constructor () {
    this.appAuth = {publicKeyID: '', privateKey: '', passphrase: ''};
  }
}
