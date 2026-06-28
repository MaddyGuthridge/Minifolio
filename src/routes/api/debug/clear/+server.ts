import { dev } from '$app/environment';
import { getDataDir, getPrivateDataDir } from '$lib/server/data/dataDir';
import { error, json } from '@sveltejs/kit';
import { rm } from 'node:fs/promises';

export async function DELETE({ cookies }: import('./$types').RequestEvent) {
  if (!dev) error(404);
  // Delete data directory
  await rm(getDataDir(), { recursive: true, force: true });
  await rm(getPrivateDataDir(), { recursive: true, force: true });

  // Also remove token from their cookies
  cookies.delete('token', { path: '/' });

  return json({}, { status: 200 });
}
