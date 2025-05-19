/**
 * Constants shared across the app
 */

/** Name of the app */
export const APP_NAME = 'Minifolio';
/** Link to app's GitHub repo */
export const APP_GITHUB = 'https://github.com/MaddyGuthridge/Minifolio';
/** Link to app documentation */
export const APP_DOCS = 'https://minifolio.maddyguthridge.com';

export const APP_ICON_URL = '/minifolio.png';

/** Author info -- `[name, URL]` */
type AuthorInfo = [string, string];

/** Primary author of the project */
export const APP_AUTHOR: AuthorInfo = ['Maddy Guthridge', 'https://maddyguthridge.com'];

/** Additional contributors to the project */
export const APP_CONTRIBUTORS: AuthorInfo[] = [];

/** Amount of time to wait after editing is finished before committing edits to the server */
export const EDIT_COMMIT_HESITATION = 1_000;

/** Common mime-types to use */
export const MIME_TYPES = {
  /** Atom feed (like RSS) */
  ATOM: 'application/atom+xml',
  /** HTML page */
  HTML: 'text/html',
} as const;

/** Tags to use for verification */
export const VERIFICATION_TAGS = {
  google: 'google-site-verification',
  bing: 'msvalidate.01',
} as const;

export default {
  APP_NAME,
  APP_GITHUB,
  APP_DOCS,
  APP_ICON_URL,
  APP_AUTHOR,
  APP_CONTRIBUTORS,
  EDIT_COMMIT_HESITATION,
  MIME_TYPES,
  VERIFICATION_TAGS,
};
