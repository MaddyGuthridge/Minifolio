import { error, text } from '@sveltejs/kit';
import { getConfig } from '$lib/server/data/config';
import { dataIsSetUp } from '$lib/server/data/dataDir';

export async function GET() {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  const config = await getConfig();
  if (config.verification.atProtocol) {
    return text(config.verification.atProtocol, { status: 200 });
  } else {
    error(404, 'Site has not configured AT protocol verification');
  }
}
