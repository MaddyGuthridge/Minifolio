import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { error, json } from '@sveltejs/kit';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import { GitConfig } from '$lib/server/git';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  await validateTokenFromRequest({ request, cookies });

  const gitConfig = await GitConfig.parseAsync(await request.json())
    .catch(e => error(400, e));

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
