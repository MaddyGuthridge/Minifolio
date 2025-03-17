
/**
 * Get a UNIX timestamp.
 * @returns current time. as a UNIX timestamp.
 */
export function unixTime(): number {
  return Math.floor(Date.now() / 1000);
}

/** Capitalize the first character of the given string */
export function capitalize(str: string): string {
  // https://stackoverflow.com/a/1026087/6335363
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function gitCommitHashShorten(hash: string): string {
  return hash.slice(0, 7);
}

/** Simple zip iterator */
export function zip<F, S>(first: F[], second: S[]): [F, S][] {
  return first.slice(0, second.length).map((f, i) => [f, second[i]]);
}

/**
 * A poor woman's imitation of Rust's Option enum, useful for avoiding cases where a value could be
 * intentionally `undefined` or something awful like that.
 */
export class Option<T> {
  static none<T>(): Option<T> {
    return new Option(false);
  }
  static some<T>(value: T): Option<T> {
    return new Option(true, value);
  }

  isSome: boolean;
  value: T | undefined;

  constructor (isSome: false);
  constructor (isSome: true, value: T);
  constructor (isSome: boolean, value?: T) {
    this.isSome = isSome;
    this.value = value;
  }

  unwrap(): T {
    if (!this.isSome) {
      throw Error('Option: Expected a some value, but got a none value');
    }
    return this.value!;
  }
}

/**
 * Type-safe way to check that an element is contained within the given const array, used to work
 * around TypeScript annoyances.
 *
 * Source: https://oida.dev/typescript-array-includes/#option-2%3A-a-helper-with-type-assertions
 */
export function constArrayIncludes<T extends E, E>(arr: readonly T[], ele: E): ele is T {
  return arr.includes(ele as T);
}

/** Return whether all values in a boolean Record are true */
export function objectAll(obj: Record<string, boolean>): obj is Record<string, true> {
  return Object.values(obj).find(v => v !== true) === undefined;
}

/**
 * Removes all characters from the given `input` string, if those characters are contained within
 * the `chars` string.
 *
 * @param input input string to remove from
 * @param chars string of characters to remove
 * @returns input string with desired characters removed
 */
function removeAllChars(input: string, chars: string): string {
  return [...chars].reduce((str, char) => str.replaceAll(char, ''), input);
}

/** Convert a name to a value that is (hopefully) safe to use as an ID */
export function nameToId(name: string): string {
  return removeAllChars(
    name
      .toLowerCase()
      .replaceAll(' ', '-'),
    "!@#$%^&*()=+[]{};:'\",<>/?\\|`~",
  );
}

/** Choose a random item from the given array */
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
