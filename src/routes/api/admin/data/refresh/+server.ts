import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { migrateAll } from '$lib/server/data/migrations';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });
  await migrateAll();

  return json({}, { status: 200 });
}
