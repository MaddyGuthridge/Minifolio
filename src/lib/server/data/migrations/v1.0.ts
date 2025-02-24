import { version } from '$app/environment';
import { setConfig } from '../config';
import { bumpPrivateDataVersion } from './shared';
import { unsafeLoadConfig } from './unsafeLoad';

export async function migratePrivateV10(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await bumpPrivateDataVersion(privateDataDir);
}

export async function migrateDataV10(dataDir: string) {
  console.log('config.json');
  await updatePublicConfig(dataDir);
}

/** Update `config.json` */
async function updatePublicConfig(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);
  await setConfig({
    version,
    verification: {
      relMe: oldConfig.relMe,
      atProtocol: null,
    },
    siteIcon: oldConfig.siteIcon,
  });
}
