import axios from 'axios';
import qs from 'qs';
import { config } from '../config';


/**
 *  Exchange the authorization code for an access token
 * @param authCode 
 * @returns 
 */
export async function exchangeAuthCodeForAccessToken(authCode: string): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

  const tokenData = {
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'Notes.Read',
  };

  const response = await axios.post(tokenEndpoint, qs.stringify(tokenData), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  console.log('Token response:', response.data);

  const token = response.data.access_token;
  return token;
}

export function getAuthUrl(): string {
  const authorizeUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

  // build query params
  const queryParams = {
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: 'Notes.Read',
    state: '12345',
  };

  const url = `${authorizeUrl}?${qs.stringify(queryParams)}`;
  return url;

}
