import { itemExists } from '#lib/server/data/item/index.ts';
import { error, redirect } from '@sveltejs/kit';
import validate from '#lib/validate.ts';

type Request = import('./$types').RequestEvent;

/**
 * Permanent redirect for Atom feeds
 */
export async function GET(req: Request) {
  const item = validate.parse(validate.itemId, `/${req.params.item}`);

  if (!await itemExists(item)) {
    error(404, `Item ${item} does not exist`);
  }

  // 308 -> permanent redirect
  return redirect(308, `/-/feed${item}`.replace(/\/$/, ''));
}
