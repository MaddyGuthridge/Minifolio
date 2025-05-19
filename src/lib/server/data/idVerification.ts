import { array, nullable, object, string } from 'superstruct';

export const IdVerificationStruct = object({
  /**
   * rel="me" verification, used by Mastodon, GitHub and Wikipedia.
   *
   * Links to place in `<link rel="me" href="{}">` fields.
   */
  relMe: array(string()),
  /**
   * AT-Protocol decentralized ID, used by Bluesky.
   *
   * Due to the design of their verification system, only one account can be verified per domain.
   *
   * ID is returned by the `/.well-known/atproto-did` endpoint
   */
  atProtocol: nullable(string()),
  /**
   * Google site verification.
   *
   * Links placed in `<meta name="google-site-verification" content="..." />` tag
   */
  google: nullable(string()),
  /**
   * Bing site verification.
   *
   * Links placed in `<meta name="msvalidate01" content="..." />` tag
   */
  bing: nullable(string()),
});
