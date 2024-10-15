import { nanoid } from 'nanoid';
import { validate, number, string, type, type Infer } from 'superstruct';
import jwt, { type Algorithm as JwtAlgorithm } from 'jsonwebtoken';
import { unixTime } from '$lib/util';
import { getLocalConfig, setLocalConfig } from '../data/localConfig';
import { error, redirect, type Cookies } from '@sveltejs/kit';
import { getAuthSecret } from './secret';

/** Maximum lifetime of a session -- 14 days */
const sessionLifetime = 60 * 60 * 24 * 14;

/** Algorithm to sign and validate JWT */
const algorithm: JwtAlgorithm = 'HS256';

/**
 * Validation for JWT payload.
 *
 * using `type` rather than `object` as there may be additional properties
 * added by the `jsonwebtoken` library.
 */
export const JwtPayload = type({
  /** Session ID */
  sessionId: string(),
  /** User ID of the user who owns this token */
  uid: string(),
  /** Expiry time (as UNIX timestamp) */
  exp: number(),
  /** Initialization time (as UNIX timestamp) */
  iat: number(),
});

/**
 * Generate a token.
 *
 * If cookies is provided, the token will also be stored to the cookies.
 */
export async function generateToken(userId: string, cookies?: Cookies): Promise<string> {
  const sessionId = nanoid();
  const iat = unixTime();

  const token = jwt.sign(
    { sessionId, iat, uid: userId },
    await getAuthSecret(),
    { expiresIn: sessionLifetime, algorithm }
  );
  const expires = iat + sessionLifetime;
  if (cookies) {
    cookies.set(
      'token',
      token,
      {
        path: '/',
        expires: new Date(expires * 1000)
      }
    );
  }
  return token;
}

/** Decode the given token, and return the session if it passes validation */
export async function validateToken(token: string): Promise<Infer<typeof JwtPayload>> {
  // If the token starts with 'Bearer ', strip that out
  if (token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  // Disallow token validation if auth is disabled
  const config = await getLocalConfig();
  if (!config.auth) {
    throw Error('Authentication is disabled');
  }
  // Otherwise attempt to validate the token
  let payload: unknown;
  try {
    payload = jwt.verify(token, await getAuthSecret(), { algorithms: [algorithm] });
  } catch (e) {
    // Token failed to validate
    if (e instanceof Error) {
      throw Error(`Token failed to validate: ${e.message}`);
    } else {
      // Should always be an error
      throw Error('Token failed to validate');
    }
  }
  // TODO: Create a helper function that lets as async-ify these checks, so
  // that it's easier to `.catch(e => error(400, e))` them
  const [err, data] = validate(payload, JwtPayload);
  if (err) {
    // Token data format is incorrect
    throw Error('Token data is in incorrect format');
  }
  // Ensure that the session isn't in our revoked list
  if (data.sessionId in config.auth[data.uid].sessions.revokedSessions) {
    throw Error('This session has been revoked');
  }

  // And also that it wasn't issued before our notBefore time
  if (data.iat < config.auth[data.uid].sessions.notBefore) {
    throw Error('This session was created too long ago');
  }
  return data;
}

export function getTokenFromRequest(req: { request: Request, cookies: Cookies }): string | undefined {
  const tokenFromHeader = req.request.headers.get('Authorization');
  const tokenFromCookie = req.cookies.get('token');

  return tokenFromHeader ?? tokenFromCookie;
}

/** Revoke the session of the given token */
export async function revokeSession(token: string): Promise<void> {
  const config = await getLocalConfig();
  if (!config.auth) {
    // Can't invalidate tokens if there is not auth
    throw Error('Authentication is disabled');
  }
  const sessionData = await validateToken(token);
  // Add to the revoked sessions
  config.auth[sessionData.uid].sessions.revokedSessions[sessionData.sessionId]
    = sessionData.exp;
  await setLocalConfig(config);
}

/**
 * Validates the token from the given request.
 *
 * Returns the user ID of the token's owner.
 *
 * First attempts to get the token from the "Authorization" header, but if that
 * isn't present, the "token" property is checked within the cookies.
 *
 * If the token is invalid, it is removed from the cookies.
 */
export async function validateTokenFromRequest(req: { request: Request, cookies: Cookies }): Promise<string> {
  const token = getTokenFromRequest(req);
  if (!token) {
    error(401, 'A token is required to access this endpoint');
  }
  const data = await validateToken(token).catch(e => {
    // Remove token from cookies, as it is invalid
    req.cookies.delete('token', { path: '/' });
    error(401, `${e}`);
  });
  return data.uid;
}

/** Return whether the request is authorized (has a valid token) */
export async function isRequestAuthorized(req: { request: Request, cookies: Cookies }): Promise<boolean> {
  // This feels kinda like Rust's Result type and I like that
  return validateTokenFromRequest(req)
    .then(() => true)
    .catch(() => false);
}

/**
 * If the given request's token is invalid, throw a redirect to the given URL.
 */
export async function redirectOnInvalidToken(req: { request: Request, cookies: Cookies }, url: string) {
  await validateTokenFromRequest(req).catch(() => redirect(303, url));
}
