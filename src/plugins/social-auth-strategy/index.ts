import { FacebookAuthenticationStrategy } from './facebook-authentication-strategy';
import { GoogleAuthenticationStrategy } from './google-authentication-strategy';
import 'dotenv/config';

const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!facebookAppId || !facebookAppSecret) {
    throw new Error(
      'Facebook App ID or App Secret not provided in environment variables.'
    );
  }
  
 export const facebookAuthenticationStrategy = new FacebookAuthenticationStrategy({
    appId: facebookAppId,
    appSecret: facebookAppSecret,
    clientToken: ''
  });
  
  
  if (!googleClientId) {
    throw new Error('Google Client ID not provided in environment variables.');
  }
  
export const googleAuthenticationStrategy = new GoogleAuthenticationStrategy(
    googleClientId
);
  