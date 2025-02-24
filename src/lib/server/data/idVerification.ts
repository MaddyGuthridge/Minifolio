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
   * ID is returned by the `/.well-known/atproto-did` endpoint
   */
  atProtocol: nullable(string()),
});
