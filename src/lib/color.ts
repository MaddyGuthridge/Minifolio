/** Code for generating colors */
import { Colord, colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { capitalize } from './util';

extend([namesPlugin]);

/** Generate a random (hopefully) nice-looking color */
export function randomColor(): string {
  return colord({
    h: Math.random() * 360,
    s: Math.random() * 100,
    v: 100,
  }).toHex();
}

/**
 * Scale lightness of color.
 */
export function withLightness(color: Colord, newLightness: number): Colord {
  const { h, s, a } = color.toHsl();
  return colord({ h, s, l: newLightness, a });
}

/** Return the name of the given color */
export function colorName(color: Colord): string {
  const rawName = color.toName({ closest: true })!;

  // List of suffixes. Since the library only gives names without spaces, we need to separate them
  // out manually
  const suffixes: (string | [string, string])[] = [
    ['springgreen', 'spring-green'],
    ['seagreen', 'sea-green'],
    ['lawngreen', 'lawn-green'],
    ['skyblue', 'sky blue'],
    ['slateblue', 'slate blue'],
    ['violetred', 'violet-red'],
    ['greenyellow', 'green-yellow'],
    ['honeydew', 'honey-dew'],
    'red',
    'brick',
    'blue',
    'green',
    'orchid',
    'turquoise',
    'aquamarine',
    'magenta',
    'purple',
    'violet',
    'pink',
    'smoke',
    'gray',
    'salmon',
    'almond',
    'brown',
    'wood',
    'orange',
    'blush',
    'lavender',
    'chiffon',
    'white',
    'grey',
    'gray',
    'rose',
    'lace',
    'drab',
    'smoke',
  ];

  for (const suffix of suffixes) {
    let suffixSearch;
    let suffixReplace;
    if (typeof suffix === 'string') {
      suffixSearch = suffixReplace = suffix;
    } else {
      [suffixSearch, suffixReplace] = suffix;
    }
    if (rawName.endsWith(suffixSearch)) {
      // Eww, Python would make this so much less painful
      const suffixRegex = new RegExp(`${suffixSearch}$`);
      return capitalize(`${rawName.replace(suffixRegex, '')} ${suffixReplace}`.trim());
    }
  }
  // No matches found, just retyurn the name as-is
  return capitalize(rawName);
}
