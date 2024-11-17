import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { assert, string } from 'superstruct';
import { getItemInfo, setItemReadme } from '$lib/server/data/itemOld.js';
import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/data/index';

export async function GET({ params }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));

  const { groupId, itemId } = params;

  try {
    return json({ readme: data.items[groupId][itemId].readme }, { status: 200 });
  } catch {
    return error(400, `Item with ID ${itemId} in group ${groupId} doesn't exist`);
  }
}

export async function PUT({ params, request, cookies }: import('./$types.js').RequestEvent) {
  await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const { groupId, itemId } = params;

  await getItemInfo(groupId, itemId)
    .catch(() => error(404, `Item with ID ${itemId} in group ${groupId} doesn't exist`));

  let readme: string;
  try {
    const newReadme = (await request.json()).readme;
    assert(newReadme, string());
    readme = newReadme;
  } catch (e) {
    return error(400, `${e}`);
  }

  await setItemReadme(groupId, itemId, readme);
  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}
