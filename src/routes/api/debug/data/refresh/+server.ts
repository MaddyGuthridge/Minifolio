/**
 * POST /api/debug/refresh
 *
 * Manually invalidate portfolio globals. Very similar to
 * POST /api/admin/data/refresh, but without authentication required.
 */
import { dev } from '$app/environment';
import { migrateAll } from '$lib/server/data/migrations';
// import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/index';
import { error, json } from '@sveltejs/kit';

export async function POST() {
  if (!dev) error(404);
  // await getPortfolioGlobals().catch(e => error(400, e));
  // invalidatePortfolioGlobals();
  await migrateAll();
  return json({}, { status: 200 });
}
