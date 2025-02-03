import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { json } from '@sveltejs/kit';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import { applyStruct } from '$lib/server/util';
import { GitConfigStruct } from '$lib/server/git';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  await validateTokenFromRequest({ request, cookies });

  const gitConfig = applyStruct(await request.json(), GitConfigStruct);

  const config = await getLocalConfig();
  config.gitConfig = gitConfig;
  await setLocalConfig(config);

  return json({}, { status: 200 });
}

export async function GET({ request, cookies }: import('./$types').RequestEvent) {
  await validateTokenFromRequest({ request, cookies });
  const config = await getLocalConfig();
  return json(config.gitConfig, { status: 200 });
}
