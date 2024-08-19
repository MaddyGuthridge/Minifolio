import { error, json } from '@sveltejs/kit';
import { dataDirIsInit, dataDirUsesGit, getDataDir } from '$lib/server/data/dataDir';
import { validateToken } from '$lib/server/auth.js';
import simpleGit from 'simple-git';
import { getPortfolioGlobals } from '$lib/server/data/index.js';

export async function GET({ request, cookies }) {
  const token = request.headers.get('Authorization');
  if (!token) {
    return error(401, 'Authorization token is required');
  }

  await getPortfolioGlobals().catch(e => error(400, e));

  await validateToken(token).catch(e => error(401, `${e}`));

  if (!await dataDirUsesGit()) {
    return json({ repo: null }, { status: 200 });
  }

  const repo = simpleGit(getDataDir());

  const status = await repo.status();
  return json(
    {
      repo: {
        url: (await repo.remote(['get-url', 'origin']) || '').trim(),
        branch: status.current,
        commit: await repo.revparse(['--short', 'HEAD']),
        clean: status.isClean()
      }
    },
    { status: 200 });
}
