/**
 * validate.ts
 *
 * Contains common validator functions shared throughout the app.
 */
import { error } from '@sveltejs/kit';
import validator from 'validator';

/** Regex for matching ID strings */
export const idValidatorRegex = /^[a-z0-9-.]+$/;

/**
 * Ensure that the given ID string is valid.
 *
 * @param type the type of ID being validated (used to produce helpful error messages).
 * @param id the ID string to validate.
 */
export function validateId(type: string, id: string): string {
  if (!id.trim().length) {
    error(400, `${type} cannot be empty`);
  }
  if (!idValidatorRegex.test(id)) {
    error(400, `${type} '${id}' is contains illegal characters`);
  }
  if (id.startsWith('.')) {
    error(400, `${type} '${id}' has a leading dot`);
  }
  if (id.endsWith('.')) {
    error(400, `${type} '${id}' has a trailing dot`);
  }
  if (id.startsWith('-')) {
    error(400, `${type} '${id}' has a leading dash`);
  }
  if (id.endsWith('-')) {
    error(400, `${type} '${id}' has a trailing dash`);
  }
  return id;
}

/** Array of illegal characters that cannot be used in names */
const illegalNameChars = ['\t', '\n', '\f', '\r'];

/** Ensure that the given name is valid */
export function validateName(name: string): string {
  if (!name) {
    error(400, 'Name cannot be empty');
  }
  if (name.trim().length !== name.length) {
    error(400, 'Name cannot contain leading or trailing whitespace');
  }
  if (
    illegalNameChars
      .reduce((n, c) => n.replace(c, ''), name)
      .length
    !== name.length
  ) {
    error(400, 'Name contains illegal whitespace characters');
  }

  return name;
}

// Can't find a clean way to match either 3 or 6 chars, but not 4 or 5
const colorValidatorRegex = /^#[0-9a-fA-F]{6}$/;

/** Validate a color is in hex form */
export function validateColor(color: string): string {
  if (!colorValidatorRegex.test(color)) {
    error(400, 'Colors must be given in hex form (#RRGGBB)');
  }
  return color;
}

/** Validate that a text field is non-empty */
export function validateNonEmpty(text: string): string {
  if (!text) {
    error(400, 'Field must not be empty');
  }
  return text;
}

/** Validate that a password is sufficiently strong */
export function validatePassword(password: string): string {
  if (!validator.isStrongPassword(password)) {
    error(400, 'Password is not strong enough');
  }
  return password;
}

export default {
  id: validateId,
  name: validateName,
  color: validateColor,
  nonEmpty: validateNonEmpty,
  password: validatePassword,
};
