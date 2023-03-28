import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { sessionStorage } from "~/services/session.server";
import { findOrCreateUser } from "~/models/user.server";

export const authenticator = new Authenticator(sessionStorage);

const AUTH0_NAMESPACE = 'https://mangia.dev/'
let auth0Strategy = new Auth0Strategy(
  {
    callbackURL: process.env.AUTH0_CALLBACK,
    clientID: process.env.AUTH0_CLIENTID,
    clientSecret: process.env.AUTH0_SECRET,
    domain: process.env.AUTH0_DOMAIN,
    scope: 'read:current_user openid profile email'
  },
  async ({profile}) => {
    const {  _json: profileData } = profile;

    const username = profileData[`${AUTH0_NAMESPACE}username`]
    // TODO: handle usernames for oauth2 users, there could possibly be 2 users with same nickname
    const userData = await findOrCreateUser(profile.emails[0].value, username ?? profile.nickname)
    
    return userData;
  }
);

authenticator.use(auth0Strategy);
