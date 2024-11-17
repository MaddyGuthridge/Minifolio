import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/data/index';
import { object, string, validate } from 'superstruct';
import { LinkStyleStruct } from '$lib/server/data/itemOld.js';
import { changeLinkStyle, createLink, removeLinkFromItem } from '$lib/server/links';

export async function POST({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const { groupId, itemId } = params;
  if (!data.groups[groupId]) {
    error(404, `Group ${groupId} does not exist`);
  }
  if (!data.items[groupId][itemId]) {
    error(404, `Item ${itemId} does not exist in group ${groupId}`);
  }

  const [err, body] = validate(
    await request.json(),
    object({ otherGroupId: string(), otherItemId: string() })
  );
  if (err) {
    return error(400, err);
  }
  const { otherGroupId, otherItemId } = body;

  if (!data.groups[otherGroupId]) {
    error(400, `Group ${otherGroupId} does not exist`);
  }
  if (!data.items[otherGroupId][otherItemId]) {
    error(400, `Item ${otherItemId} does not exist in group ${otherGroupId}`);
  }

  // Check for self-links
  if (groupId === otherGroupId && itemId === otherItemId) {
    error(400, 'Cannot link to same item');
  }

  await createLink(data, groupId, itemId, otherGroupId, otherItemId);
  await createLink(data, otherGroupId, otherItemId, groupId, itemId);

  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}

export async function PUT({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const { groupId, itemId } = params;
  if (!data.groups[groupId]) {
    error(404, `Group ${groupId} does not exist`);
  }
  if (!data.items[groupId][itemId]) {
    error(404, `Item ${itemId} does not exist in group ${groupId}`);
  }

  const [err, body] = validate(
    await request.json(),
    object({ otherGroupId: string(), style: LinkStyleStruct })
  );
  if (err) {
    return error(400, `${err}`);
  }
  const { otherGroupId, style: newStyle } = body;
  if (!data.groups[otherGroupId]) {
    error(400, `Group ${otherGroupId} does not exist`);
  }

  await changeLinkStyle(data, groupId, itemId, otherGroupId, newStyle);
  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}

export async function DELETE(req: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest(req);

  const { groupId, itemId } = req.params;
  if (!data.groups[groupId]) {
    error(404, `Group ${groupId} does not exist`);
  }
  if (!data.items[groupId][itemId]) {
    error(404, `Item ${itemId} does not exist in group ${groupId}`);
  }

  const otherGroupId = req.url.searchParams.get('otherGroupId');
  const otherItemId = req.url.searchParams.get('otherItemId');

  if (!otherGroupId || !otherItemId) {
    error(400, 'Requires query params otherGroupId and otherItemId');
  }

  if (!data.groups[otherGroupId]) {
    error(400, `Group ${otherGroupId} does not exist`);
  }
  if (!data.items[otherGroupId][otherItemId]) {
    error(400, `Item ${otherItemId} does not exist in group ${otherGroupId}`);
  }

  await removeLinkFromItem(data, groupId, itemId, otherGroupId, otherItemId);
  await removeLinkFromItem(data, otherGroupId, otherItemId, groupId, itemId);

  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}
