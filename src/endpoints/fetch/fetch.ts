import dotenv from 'dotenv';
import ApiError from './ApiError';
import { browser } from '$app/environment';
import response from './response';
import type { PayloadInfo } from './payload';

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Determines the URL to send requests to.
 *
 * For example, if running in the browser, request to the current host
 * Or if running in test suite, request to `process.env` `HOST` and `PORT`.
 *
 * @returns URL of the backend server
 */
export function getUrl() {
  if (browser) {
    // Running in browser (request to whatever origin we are running in)
    return '';
  } else {
    // Running in node
    dotenv.config();

    const PORT = process.env.PORT!;
    const HOST = process.env.HOST!;
    return `http://${HOST}:${PORT}`;
  }
}

/**
 * Fetch some data from the backend
 *
 * @param method Type of request
 * @param route Endpoint to request to
 * @param options options for the request
 *
 * @returns object giving access to the response in various formats
 */
export function apiFetch(
  fetchFn: typeof fetch,
  method: HttpVerb,
  route: string,
  options?: {
    token?: string,
    query?: Record<string, string>,
  } & Partial<PayloadInfo>,
) {
  const baseUrl = getUrl();

  const contentType = options?.contentType;
  const query = options?.query ?? {};
  const body = options?.payload;

  const tokenHeader = options?.token ? { Authorization: `Bearer ${options.token}` } : {};
  const contentTypeHeader = (contentType && ['POST', 'PUT'].includes(method)) ? { 'Content-Type': contentType } : {};

  const headers = new Headers({
    ...tokenHeader,
    ...contentTypeHeader,
  } as Record<string, string>);

  let url: string;

  if (Object.keys(query).length) {
    url
      = `${baseUrl}${route}?`
        + new URLSearchParams(query).toString();
  } else {
    url = `${baseUrl}${route}`;
  }

  // Now send the request
  try {
    return response(fetchFn(url, {
      method,
      body,
      headers,
      // Include credentials so that the token cookie is sent with the request
      // https://stackoverflow.com/a/76562495/6335363
      credentials: 'same-origin',
    }));
  } catch (err) {
    // Likely a network issue
    if (err instanceof Error) {
      throw new ApiError(null, err.message);
    } else {
      throw new ApiError(null, `Unknown request error ${err}`);
    }
  }
}
