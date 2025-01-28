/** Code for generating colors */
import { colord, extend } from 'colord';
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

/** Return the name of the given color */
export function colorName(color: string): string {
  const rawName = colord(color).toName({ closest: true })!;

  const suffixes: (string | [string, string])[] = [
    'red',
    'blue',
    ['seagreen', 'sea-green'],
    'green',
    'orchid',
    'turquoise',
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
      return capitalize(`${rawName.replace(suffixRegex, '')} ${suffixReplace}`);
    }
  }
  // No matches found, just retyurn the name as-is
  return capitalize(rawName);
}
