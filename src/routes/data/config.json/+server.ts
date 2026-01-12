import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { ConfigJson, getConfig, setConfig } from '$lib/server/data/config';
import { version } from '$app/environment';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import serverValidate from '$lib/server/serverValidate';
import itemId from '$lib/itemId';
import z from 'zod';
import validate from '$lib/validate';

export async function GET() {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  return json(await getConfig(), { status: 200 });
}

export async function PUT({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  const newConfig = validate.parse(ConfigJson, await request.json());

  if (newConfig.version !== version) {
    return error(
      400,
      `New version (${newConfig.version}) doesn't match server version (${version})`,
    );
  }

  // Check for invalid site verification
  for (const url of newConfig.verification.relMe) {
    z.httpUrl(url);
  }
  if (newConfig.verification.atProtocol !== null) {
    if (newConfig.verification.atProtocol === '') {
      error(400, 'AT verification string cannot be empty (use `null` instead)');
    }
    if (!newConfig.verification.atProtocol.startsWith('did:')) {
      error(400, 'AT verification string must start with "did:"');
    }
  }

  // Check for invalid icon
  if (newConfig.siteIcon) {
    await serverValidate.image(itemId.ROOT, newConfig.siteIcon);
  }

  await setConfig(newConfig);

  return json({}, { status: 200 });
}
