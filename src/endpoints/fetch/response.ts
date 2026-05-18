import ApiError from './ApiError';

function tryJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Process a text response, returning the text as a string */
export async function text(response: Promise<Response>): Promise<string> {
  const res = await response;
  if ([404, 405].includes(res.status)) {
    throw new ApiError(404, `Error ${res.status} at ${res.url}`, tryJson(await res.text()));
  }
  const text = await res.text();
  if ([400, 401, 403].includes(res.status)) {
    throw new ApiError(res.status, text, tryJson(text));
  }
  if (![200, 304].includes(res.status)) {
    // Unknown error
    throw new ApiError(res.status, `Request got status code ${res.status}`, tryJson(text));
  }
  return text;
}

/** Process an XML response, converting it to a JS object */
export async function xml(response: Promise<Response>): Promise<object> {
  // TODO: Fix this coed duplication
  const res = await response;
  if ([404, 405].includes(res.status)) {
    throw new ApiError(404, `Error ${res.status} at ${res.url}`, tryJson(await res.text()));
  }
  const text = await res.text();
  if ([400, 401, 403].includes(res.status)) {
    throw new ApiError(res.status, text, tryJson(text));
  }
  if (![200, 304].includes(res.status)) {
    // Unknown error
    throw new ApiError(res.status, `Request got status code ${res.status}`, tryJson(text));
  }

  // Import dynamically, to avoid front-end glitches.
  const xml = await import('xmlbuilder2');

  return xml.convert(text, { format: 'object' });
}

/** Process a JSON response, returning the data as a JS object */
export async function json(response: Promise<Response>): Promise<object> {
  const res = await response;
  if ([404, 405].includes(res.status)) {
    throw new ApiError(404, `Error ${res.status} at ${res.url}`, tryJson(await res.text()));
  }
  if (res.status >= 500) {
    // Unknown error
    throw new ApiError(res.status, `Request got status code ${res.status}`, tryJson(await res.text()));
  }
  // Decode the data
  const text = await res.text();
  let json: object;
  try {
    json = JSON.parse(text);
  } catch (err) {
    // JSON parse error
    if (err instanceof Error) {
      throw new ApiError(null, err.message, tryJson(text));
    } else {
      throw new ApiError(null, `Unknown JSON error ${err}`, tryJson(text));
    }
  }

  if ([400, 401, 403].includes(res.status)) {
    // All 400, 401 and 403 errors have an error message
    const message = (json as { message: string }).message;
    throw new ApiError(res.status, message, tryJson(text));
  }

  // Got valid data
  // Assign it to a new object, because otherwise it'll fail to match using
  // `.toStrictEqual`, likely due to some weirdness with Jest.
  // Seems to be similar to the issues described at these URLs
  // https://github.com/jestjs/jest/issues/8446
  // https://github.com/nktnet1/jewire?tab=readme-ov-file#53-rewire-and-jest
  // TODO: Is this still an issue when working with Vitest?
  return Object.assign({}, json);
}

export async function buffer(response: Promise<Response>): Promise<Uint8Array> {
  const res = await response;
  if ([404, 405].includes(res.status)) {
    throw new ApiError(404, `Error ${res.status} at ${res.url}`, tryJson(await res.text()));
  }
  const buf = await res.bytes();
  if ([400, 401, 403].includes(res.status)) {
    throw new ApiError(res.status, buf, tryJson(await res.text()));
  }
  if (![200, 304].includes(res.status)) {
    // Unknown error
    throw new ApiError(res.status, `Request got status code ${res.status}`, tryJson(await res.text()));
  }
  return buf;
}

/**
 * Handler for responses, allowing users to `.<format>` to get the response data in the format they
 * desire
 */
export default (response: Promise<Response>) => ({
  json: () => json(response),
  xml: () => xml(response),
  text: () => text(response),
  buffer: () => buffer(response),
  response,
});
