import * as Http from 'request-promise';

export class Authentifier {
  private static _cached: {[key: string]: {token: string; expires: number }};
  public static async getToken(opt: { url: string; client: string; secret: string; scope: string }): Promise<string> {
    if (!Authentifier._cached) {Authentifier._cached = {}; }
    if (!Authentifier._cached[opt.client] || Authentifier._cached[opt.client].expires <= new Date().getTime()) {
      const body = {
        client_id: opt.client,
        client_secret: opt.secret,
        grant_type: 'client_credentials',
        scope: opt.scope,
      };
      const resp = await Http.post(opt.url, {
        form: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const respObj = JSON.parse(resp);
      // console.info(respObj);
      Authentifier._cached[opt.client] = {
        expires: new Date().getTime() + respObj.expires_in * 1000 - 5000,
        token: respObj.access_token,
      };
    }
    return Authentifier._cached[opt.client].token;
  }
}
