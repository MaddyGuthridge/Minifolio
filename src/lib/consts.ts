/**
 * Constants shared across the app
 */

/** Name of the app */
export const APP_NAME = 'Minifolio';
/** Link to app's GitHub repo */
export const APP_GITHUB = 'https://github.com/MaddyGuthridge/Minifolio';

/** Author info -- `[name, URL]` */
type AuthorInfo = [string, string];

/** Primary author of the project */
export const APP_AUTHOR: AuthorInfo = ['Maddy Guthridge', 'https://maddyguthridge.com'];

/** Additional contributors to the project */
export const APP_CONTRIBUTORS: AuthorInfo[] = [];

export default {
  APP_NAME,
  APP_GITHUB,
  APP_AUTHOR,
  APP_CONTRIBUTORS,
};
