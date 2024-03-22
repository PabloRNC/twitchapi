import type { RefreshTokenResponse, TokenClientCredentialsFlowResponse, TokenCodeFlowResponse } from '@twitchapi/api-types';
import type { BaseClient } from './BaseClient';
import { TokenAdapter } from './structures';
import { TwitchHelixError } from './structures/TwitchHelixError';
import type { GetResponses, PostResponses, PatchResponses, PutResponses, RequestOptions, PostBody, PatchBody, PutBody, TokenTypes } from './types';
import type { Error, GenerateAppTokenOptions } from './interfaces';




export class RequestManager {

  public client: BaseClient;
  public baseURL: string;
  public authURL: string;

  public constructor(client: BaseClient) {

    this.client = client;
    this.baseURL = client.proxy ?? 'https://api.twitch.tv/helix';
    this.authURL = 'https://id.twitch.tv';
  }


  public async get(endpoint: string, params: string, requestOptions: RequestOptions): GetResponses {

    const res = await fetch(this.baseURL + endpoint + `?${params}`, { method: 'GET', headers: this.makeHeaders(requestOptions) });

    if (!res.ok) {

      const token = this.getToken(requestOptions);

      if (token?.type === 'implicit' || !token?.refresh || await this.validateToken(requestOptions) || requestOptions?.refreshToken === false) throw new TwitchHelixError(res, await res.json() as Error, 'GET');

      const refreshedToken = await this.handleTokenAdapterRefresh(token as TokenAdapter<'code' | 'app', true>);

      this.setProperToken(token as TokenAdapter<TokenTypes, true>, refreshedToken, requestOptions);

      return await this.get(endpoint, params, { ...requestOptions, refreshToken: false });


    }

    return await res.json();
  }

  public async delete(endpoint: string, params: string, requestOptions: RequestOptions) {

    const res = await fetch(this.baseURL + endpoint + `?${params}`, { method: 'DELETE', headers: this.makeHeaders(requestOptions) });

    if (!res.ok) {

      const token = this.getToken(requestOptions) as TokenAdapter;

      if (token?.type === 'implicit' || !token?.refresh || await this.validateToken(requestOptions) || requestOptions?.refreshToken === false) throw new TwitchHelixError(res, await res.json() as Error, 'DELETE');

      const refreshedToken = await this.handleTokenAdapterRefresh(token as TokenAdapter<'code' | 'app', true>);

      this.setProperToken(token as TokenAdapter<TokenTypes, true>, refreshedToken, requestOptions);

      await this.delete(endpoint, params, { ...requestOptions, refreshToken: false });


    }

  }

  public async post(endpoint: string, params: string, body: PostBody, requestOptions: RequestOptions): PostResponses {

    const res = await fetch(this.baseURL + endpoint + `?${params}`, { method: 'POST', headers: this.makeHeaders(requestOptions), body: JSON.stringify(body) });

    if (!res.ok) {

      const token = this.getToken(requestOptions) as TokenAdapter;

      if (token?.type === 'implicit' || !token?.refresh || await this.validateToken(requestOptions) || requestOptions?.refreshToken === false) throw new TwitchHelixError(res, await res.json() as Error, 'POST');

      const refreshedToken = await this.handleTokenAdapterRefresh(token as TokenAdapter<'code' | 'app', true>);

      this.setProperToken(token as TokenAdapter<TokenTypes, true>, refreshedToken, requestOptions);

      return await this.post(endpoint, params, body, { ...requestOptions, refreshToken: false });

    }

    if (res.status === 204) return;

    return await res.json();
  }

  public async patch(endpoint: string, params: string, body: PatchBody, requestOptions: RequestOptions): PatchResponses {

    const res = await fetch(this.baseURL + endpoint + `?${params}`, { method: 'PATCH', headers: this.makeHeaders(requestOptions), body: JSON.stringify(body) });

    if (!res.ok) {


      const token = this.getToken(requestOptions) as TokenAdapter;

      if (token?.type === 'implicit' || !token?.refresh || await this.validateToken(requestOptions) || requestOptions?.refreshToken === false) throw new TwitchHelixError(res, await res.json() as Error, 'PATCH');

      const refreshedToken = await this.handleTokenAdapterRefresh(token as TokenAdapter<'code' | 'app', true>);

      this.setProperToken(token as TokenAdapter<TokenTypes, true>, refreshedToken, requestOptions);

      return await this.patch(endpoint, params, body, { ...requestOptions, refreshToken: false });


    }

    return await res.json();
  }

  public async put(endpoint: string, params: string, body: PutBody, requestOptions: RequestOptions): PutResponses {

    const res = await fetch(this.baseURL + endpoint + `?${params}`, { method: 'PUT', headers: this.makeHeaders(requestOptions), body: JSON.stringify(body) });

    if (!res.ok) {

      const token = this.getToken(requestOptions) as TokenAdapter;

      if (token?.type === 'implicit' || !token?.refresh || await this.validateToken(requestOptions) || requestOptions?.refreshToken === false) throw new TwitchHelixError(res, await res.json() as Error, 'PUT');

      const refreshedToken = await this.handleTokenAdapterRefresh(token as TokenAdapter<'code' | 'app', true>);

      this.setProperToken(token as TokenAdapter<TokenTypes, true>, refreshedToken, requestOptions);

      return await this.put(endpoint, params, body, { ...requestOptions, refreshToken: false });


    }

    if (res.status === 204) return;

    return await res.json();
  }

  public async validateToken(requestOptions: RequestOptions, noError: boolean = true) {

    const res = await fetch(this.authURL + '/oauth2/validate', { headers: this.makeHeaders(requestOptions) });

    if (!res.ok) {

      switch (noError) {

      case true: return false;

        break;

      case false: throw new TwitchHelixError(res, await res.json() as Error, 'GET');

      }

    }

    return true;
  }

  public async refreshToken(refreshToken: string) {

    const res = await fetch(this.authURL + `/oauth2/token?${new URLSearchParams({ client_id: this.client.clientID, client_secret: this.client.clientSecret, grant_type: 'refresh_token', refresh_token: refreshToken }).toString()}`, { method: 'POST' });

    if (!res.ok) throw new TwitchHelixError(res, await res.json() as Error, 'POST');

    return await res.json() as RefreshTokenResponse;

  }

  public async generateUserToken(code: string, redirectURI: string) {

    const res = await fetch(this.authURL + `/oauth2/token?${new URLSearchParams({ client_id: this.client.clientID, client_secret: this.client.clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectURI }).toString()}`, { method: 'POST' });

    if (!res.ok) throw new TwitchHelixError(res, await res.json() as Error, 'POST');

    return await res.json() as TokenCodeFlowResponse;

  }

  public async generateAppToken(options?: GenerateAppTokenOptions) {

    const res = await fetch(this.authURL + `/oauth2/token?${new URLSearchParams({ client_id: options?.clientID ?? this.client.clientID, client_secret: options?.clientSecret ?? this.client.clientSecret, grant_type: 'client_credentials' }).toString()}`, { method: 'POST' });

    if (!res.ok) throw new TwitchHelixError(res, await res.json() as Error, 'POST');

    return await res.json() as TokenClientCredentialsFlowResponse;

  }

  public static async generateAppToken(options: GenerateAppTokenOptions){

    const res = await fetch(`https://id.twitch.tv/oauth2/token?${new URLSearchParams({ client_id: options?.clientID, client_secret: options?.clientSecret, grant_type: 'client_credentials' }).toString()}`, { method: 'POST' });

    if (!res.ok) throw new TwitchHelixError(res, await res.json() as Error, 'POST');

    return await res.json() as TokenClientCredentialsFlowResponse;
  }

  private makeHeaders(requestOptions: RequestOptions) {

    const token = this.getToken(requestOptions);

    const headers = { 'Authorization': `Bearer ${token?.token}`, 'Client-Id': this.client.clientID, 'Content-Type': 'application/json' };

    return headers;

  }

  private getToken(requestOptions: RequestOptions) {

    let token: TokenAdapter<TokenTypes, boolean>;

    switch (requestOptions?.useTokenType) {

    case 'app': token = this.client.appToken;

      break;

    case 'user': {

      setRequestOptionsType<'user'>(requestOptions);

      token = requestOptions.userToken || this.client.userToken;

    }

      break;

    default: token = this.client.preferedToken === 'app' ? this.client.appToken : this.client.userToken;

      break;

    }

    return token;
  }

  private async handleTokenAdapterRefresh(token: TokenAdapter<'code' | 'app', true>) {

    if (token.type === 'app') {

      setTokenType<'app', true>(token);

      const data = await this.generateAppToken({ raw: true });

      const newToken = new TokenAdapter({ ...token }).setToken(data.access_token);

      const onAppTokenRefresh = this.client.callbacks.onAppTokenRefresh;

      if(onAppTokenRefresh) onAppTokenRefresh(token, newToken);

      return newToken;

    } else {

      setTokenType<'code', true>(token);

      const data = await this.refreshToken(token.refreshToken);

      const newToken = new TokenAdapter({ ...token }).setToken(data.access_token).setRefreshToken(data.refresh_token);

      const onUserTokenRefresh = this.client.callbacks.onUserTokenRefresh;

      if(onUserTokenRefresh) onUserTokenRefresh(token, newToken);
      
      return newToken;

    }
  }

  private setProperToken(oldToken: TokenAdapter<TokenTypes, true>, newToken: TokenAdapter<TokenTypes, true>, requestOptions: RequestOptions){

    if(oldToken.isUserToken()){

      if((requestOptions as RequestOptions<'user'>)?.userToken){
        requestOptions = { ...requestOptions, userToken: newToken as TokenAdapter<'code', true> };
      }else this.client.setUserToken(newToken as TokenAdapter<'code', true>);

    } else this.client.setAppToken(newToken as TokenAdapter<'app', true>);
  }
}

function setRequestOptionsType<T extends 'app' | 'user'>(requestOptions: RequestOptions): asserts requestOptions is RequestOptions<T> { }

function setTokenType<T extends TokenTypes = TokenTypes, K extends boolean = true>(token: TokenAdapter<TokenTypes, boolean>): asserts token is TokenAdapter<T, K> {}