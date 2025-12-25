import z from 'zod';

export const IdVerificationStruct = z.strictObject({
  /**
   * rel="me" verification, used by Mastodon, GitHub and Wikipedia.
   *
   * Links to place in `<link rel="me" href="{}">` fields.
   */
  relMe: z.array(z.string()),
  /**
   * AT-Protocol decentralized ID, used by Bluesky.
   *
   * Due to the design of their verification system, only one account can be verified per domain.
   *
   * ID is returned by the `/.well-known/atproto-did` endpoint
   */
  atProtocol: z.string().nullable(),
  /**
   * Google site verification.
   *
   * Links placed in `<meta name="google-site-verification" content="..." />` tag
   */
  google: z.string().nullable(),
  /**
   * Bing site verification.
   *
   * Links placed in `<meta name="msvalidate01" content="..." />` tag
   */
  bing: z.string().nullable(),
});
