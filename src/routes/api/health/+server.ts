/**
 * POST /api/health
 *
 * Perform basic checks to ensure the server is healthy.
 */
import itemId from '$lib/itemId';
import { getConfig } from '$lib/server/data/config';
import { authIsSetUp, dataIsSetUp } from '$lib/server/data/dataDir';
import { getItemData } from '$lib/server/data/item';
import { getLocalConfig } from '$lib/server/data/localConfig';
import { json } from '@sveltejs/kit';

export async function GET() {
  let localConfigOk = null;
  if (await authIsSetUp()) {
    localConfigOk = await getLocalConfig().then(() => true).catch(() => false);
  }

  let configOk = null;
  let dataOk = null;

  if (await dataIsSetUp()) {
    configOk = await getConfig().then(() => true).catch(() => false);
    dataOk = await getItemData(itemId.ROOT).then(() => true).catch(() => false);
  }

  const healthy = localConfigOk !== false && dataOk !== false && configOk !== false;

  return json(
    { healthy, localConfigOk, configOk, dataOk } satisfies HealthcheckResponse,
    { status: healthy ? 200 : 500 },
  );
}

export type HealthcheckResponse = {
  healthy: boolean,
  localConfigOk: boolean | null,
  configOk: boolean | null,
  dataOk: boolean | null,
};
