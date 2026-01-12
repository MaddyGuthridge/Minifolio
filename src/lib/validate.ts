/**
 * validate.ts
 *
 * Contains common validator functions shared throughout the app.
 */
import { error } from '@sveltejs/kit';
import validator from 'validator';
import z from 'zod';

/** Parse the given zod schema, giving an error 400 if parsing fails */
export function parse<Out>(
  zodSchema: { parse: (value: unknown) => Out },
  value: unknown,
  err: string | undefined = undefined,
): Out {
  try {
    return zodSchema.parse(value);
  } catch (e) {
    if (e instanceof z.ZodError) {
      error(400, err ?? e);
    } else {
      throw e;
    }
  }
}

/** Zod validator for an ID component. */
export const idComponent = z.string()
  .refine(s => !s.trim.length, { error: 'Cannot be empty' })
  .regex(/^[a-z0-9-.]+$/, { error: 'Contains illegal characters' })
  .refine(s => !s.startsWith('.'), { error: 'Has a leading dot' })
  .refine(s => !s.endsWith('.'), { error: 'Has a trailing dot' })
  .refine(s => !s.startsWith('-'), { error: 'Has a leading dash' })
  .refine(s => !s.endsWith('-'), { error: 'Has a trailing dash' });

/** Zod validator for an item ID. */
export const itemId = z.string()
  .startsWith('/')
  .refine(
    (s) => {
      if (s === '/') return true;
      return !s.split('/').slice(1).find(component => !idComponent.safeParse(component).success);
    },
    { error: 'Components of ID are invalid' },
  )
  .brand<'ItemId'>();

export type ItemId = z.infer<typeof itemId>;

/** Zod validator for a name. */
export const name = z.string()
  .nonempty()
  .refine(s => s.trim().length === s.length, { error: 'Has leading or trailing whitespace' })
  .refine(
    s => ['\t', '\n', '\f', '\r'].reduce((c, badC) => c.replace(badC, ''), s).length === s.length,
    { error: 'Contains illegal whitespace characters' });

/** Zod validator for hex color */
export const color = z.string()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: 'Colors must be given in hex form (#RRGGBB)' });

/** Zod validator for strong password */
export const password = z.string()
  .refine(s => validator.isStrongPassword(s), { error: 'Password is not strong enough' });

export default {
  parse,
  idComponent,
  itemId,
  name,
  color,
  password,
};
