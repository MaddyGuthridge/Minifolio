/**
 * Code for performing common redirects
 */

import { redirect, type Cookies } from '@sveltejs/kit';
import { authIsSetUp, dataIsSetUp } from './data/dataDir';
import { validateTokenFromRequest } from './auth';

/**
 * If data isn't set up, redirect user to the appropriate setup page
 */
export async function redirectForSetup() {
    if (!await authIsSetUp()) {
      redirect(303, '/admin/firstrun/account');
    }
    if (!await dataIsSetUp()) {
      redirect(303, '/admin/firstrun/data');
    }
}

/**
 * If the given request's token is invalid, throw a redirect to the given URL.
 */
export async function redirectOnInvalidToken(req: { request: Request, cookies: Cookies }, url: string) {
  await validateTokenFromRequest(req).catch(() => redirect(303, url));
}
