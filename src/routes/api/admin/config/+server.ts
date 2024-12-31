import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { ConfigJsonStruct, getConfig, setConfig } from '$lib/server/data/config';
import { validate } from 'superstruct';
import { version } from '$app/environment';
import fs from 'fs/promises';
import { dataIsSetUp, getDataDir } from '$lib/server/data/dataDir';

export async function GET({ request, cookies }: import('./$types.js').RequestEvent) {
  if (await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  return json(getConfig(), { status: 200 });
}

export async function PUT({ request, cookies }: import('./$types.js').RequestEvent) {
  if (await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  const [err, newConfig] = validate(await request.json(), ConfigJsonStruct);

  if (err) {
    return error(400, `${err}`);
  }

  if (newConfig.version !== version) {
    return error(
      400,
      `New version (${newConfig.version}) doesn't match server version (${version})`
    );
  }

  // Check for invalid icon
  if (newConfig.siteIcon) {
    await fs.access(`${getDataDir()}/${newConfig.siteIcon}`, fs.constants.R_OK)
      .catch(() => error(400, `Cannot access site icon ${newConfig.siteIcon}`));
  }

  await setConfig(newConfig);

  return json({}, { status: 200 });
}
