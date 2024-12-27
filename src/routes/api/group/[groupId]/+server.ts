import { error, json } from '@sveltejs/kit';
import { createGroup, deleteGroup, GroupInfoStruct, setGroupInfo } from '$lib/server/data/group';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { object, string, validate } from 'superstruct';
import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/data/index';
import { validateId, validateName } from '$lib/validate.js';
import { removeAllLinksToItem } from '$lib/server/links';
import { setConfig } from '$lib/server/data/config';

export async function GET({ params }: import('./$types.js').RequestEvent) {
  const groupId = params.groupId;

  const data = await getPortfolioGlobals().catch(e => error(400, e));

  try {
    return json(data.groups[groupId].info, { status: 200 });
  } catch {
    // Catch "cannot read properties of undefined"
    return error(404, `Group with ID ${groupId} doesn't exist`);
  }
}

export async function POST({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  // Validate group ID
  const groupId = validateId('Group ID', params.groupId);

  const [err, body] = validate(await request.json(), object({ name: string(), description: string() }));
  if (err) {
    return error(400, err);
  }
  const { name, description } = body;
  validateName(name);

  if (data.groups[groupId]) {
    return error(400, `Group with ID ${groupId} already exists`);
  }

  await createGroup(groupId, name, description);
  data.config.listedGroups.push(groupId);
  await setConfig(data.config);
  invalidatePortfolioGlobals();

  return json({}, { status: 200 });
}

export async function PUT({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const groupId = params.groupId;

  if (!data.groups[groupId]) {
    return error(404, `Group with ID ${groupId} doesn't exist`);
  }

  const [err, info] = validate(await request.json(), GroupInfoStruct);

  if (err) {
    return error(400, err);
  }

  // Validate name
  validateName(info.name);

  // Check for invalid listedItems
  for (const itemId of info.listedItems) {
    if (!(itemId in data.items[groupId])) {
      error(400, `Item '${itemId}' does not exist in group '${groupId}'`);
    }
  }

  // TODO: Other validation

  await setGroupInfo(groupId, info);
  invalidatePortfolioGlobals();

  return json({}, { status: 200 });
}

export async function DELETE({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const groupId = params.groupId;

  if (!data.groups[groupId]) {
    return error(404, `Group with ID ${groupId} doesn't exist`);
  }

  // Remove all links to each item in the group
  await Promise.all(Object.keys(data.items[groupId]).map(
    itemId => removeAllLinksToItem(data, groupId, itemId)));

  // Now delete the group
  await deleteGroup(groupId);
  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}
