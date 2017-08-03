/**
 Ejemplo json
 {
    "access_token": "T9cE5asGnuyYCCqIZFoWjFHvNbvVqHjl",
    "expires_in": 3600,
    "restricted_to": [],
    "token_type": "bearer",
    "refresh_token": "J7rxTiWOHMoSC1isKZKBZWizoRXjkQzig5C6jFgCVJ9bUnsUfGMinKBDLZWP9BgR"
}
 */


export class BoxAuthInfo {
  accessToken : string;
  expiresIn : number;
  restrictedTo : Array<any>;
  tokenType : string;
  refreshToken : string;
}