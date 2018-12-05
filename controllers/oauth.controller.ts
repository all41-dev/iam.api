import {Request, Response, NextFunction} from "express";
import {ControllerBase} from "@informaticon/base-microservice";
import * as express from "express";

export class OAuthController extends ControllerBase {
    constructor() {
        super();
    }

    public static create(baseUrl: string, server: express.Application) {
        const router = ControllerBase.getNewRouter();

        /** Welcome page **/
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new OAuthController().index(req, res, next);
        });

        router.get('/.well-known/openid-configuration', (req: Request, res: Response, next: NextFunction) => {
            new OAuthController().getConfig(req, res, next);
        });

        router.get('/oauth2/certs', (req: Request, res: Response, next: NextFunction) => {
            new OAuthController().getCertificates(req, res, next);
        });


        server.use(baseUrl, router);
    }

    public index(req: Request, res: Response, next: NextFunction) {
        res.render('index', { title: 'Informaticon OAuth Server' });
    }

    public getConfig(req: Request, res: Response, next: NextFunction) {
        const apiHost = req.protocol + '://' + req.get('host'); // + req.originalUrl;
        const uiHost = 'http://localhost:4201';

        res.json({
            "issuer": apiHost,//"http://localhost:1212",
            "authorization_endpoint": `${uiHost}/authentication`,//"http://localhost:4200/authentication",
            "token_endpoint": `${apiHost}/oauth/token`,//"http://localhost:1212/oauth/token",
            "userinfo_endpoint": `${apiHost}/profile`,//"http://localhost:1212/profile",
            "revocation_endpoint": "https://accounts.google.com/o/oauth2/revoke",
            "jwks_uri": `${apiHost}/oauth2/certs`,//"http://localhost:1212/oauth2/certs",
            "response_types_supported": [
                "code",
                "token",
                "id_token",
                "code token",
                "code id_token",
                "token id_token",
                "code token id_token",
                "none"
            ],
            "subject_types_supported": [
                "public"
            ],
            "id_token_signing_alg_values_supported": [
                "RS256"
            ],
            "scopes_supported": [
                "openid",
                "email",
                "profile"
            ],
            "token_endpoint_auth_methods_supported": [
                "client_secret_post",
                "client_secret_basic"
            ],
            "claims_supported": [
                "aud",
                "email",
                "email_verified",
                "exp",
                "family_name",
                "given_name",
                "iat",
                "iss",
                "locale",
                "name",
                "picture",
                "sub"
            ],
            "code_challenge_methods_supported": [
                "plain",
                "S256"
            ]
        });
    }

    public getCertificates(req: Request, res: Response, next: NextFunction) {
        res.json({
            "keys": [
                {
                    "kty": "RSA",
                    "alg": "RS256",
                    "use": "sig",
                    "kid": "4129db2ea1860d2e871ee48506287fb05b04ca3f",
                    "n": "sphx6KhpetKXk/oR8vrDxwN8aaLsiBsYNvrWCA9oDcubuDD/YLnXH65QnNoRdlOW0+dCAStZVB3VtHR9qyUbqCvS443xC59nDrEHEpTO8+zeHzkkIp4zVU0vvowZlkVqZZA032dCEaB4LSIzZoxWa1OHSfmQgR90zMVDCI98YCNvTGrdJ66GrYRVdjnd5Jg5ebZVtfa9VMN1WBro02pLJ8K/cux/i7KO0zovDYhID90wNU/q8F1nzlDcs5TiPPBBTNWfGLMRVec2xbIpQ9T3Ou0Yn4xPUimwVRSrvkcCF1MTbm55/Jv9EdRbrVk46n3qZMbx0cHDGCUjaAcKbkVkcQ==",
                    "e": "AQAB"
                }
            ]
        });
    }
}