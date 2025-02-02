/** Code for managing the server's SSH keys */
import fs from 'fs/promises';
import { getPrivateDataDir } from './data/dataDir';
import { spawn } from 'child-process-promise';
import { APP_NAME } from '$lib/consts';
import { getLocalConfig, setLocalConfig } from './data/localConfig';
import path from 'path';

const DEFAULT_KEY_TYPE = 'ed25519';

export const defaultKeysDirectory = () => path.join(getPrivateDataDir(), 'keys');
const defaultPrivateKeyPath = () => path.join(defaultKeysDirectory(), `id_${DEFAULT_KEY_TYPE}`);

const publicKeyPath = (privateKeyPath: string) => `${privateKeyPath}.pub`;

export async function getPrivateKeyPath(): Promise<string | null> {
  return await getLocalConfig().then(c => c.keyPath)
}

/** Returns the server's SSH public key */
export async function getPublicKey(): Promise<string | null> {
  // Determine public key location;
  const keyPath = await getPrivateKeyPath();

  if (!keyPath) {
    return null;
  }

  // Read the key from the disk
  const key = await fs.readFile(publicKeyPath(keyPath), { encoding: 'utf-8' })
    .then(k => k.trim());
  return key;
}

/**
 * Set the path to the program's SSH key file.
 */
export async function setKeyPath(keyPath: string) {
  const cfg = await getLocalConfig();
  cfg.keyPath = keyPath;
  await setLocalConfig(cfg);
}

/** Disable the server's SSH authentication */
export async function disableKey() {
  const cfg = await getLocalConfig();
  cfg.keyPath = null;
  await setLocalConfig(cfg);
}

/** Generate an SSH key pair for the server */
export async function generateKey(): Promise<string> {
  // Unlink default keys if they already exist, then recreate their directory
  await fs.unlink(defaultPrivateKeyPath()).catch(() => { });
  await fs.unlink(publicKeyPath(defaultPrivateKeyPath())).catch(() => { });
  await fs.mkdir(defaultKeysDirectory(), { recursive: true }).catch(() => { });

  // Change configuration to use default SSH key location
  const cfg = await getLocalConfig();
  cfg.keyPath = defaultPrivateKeyPath();
  await setLocalConfig(cfg);

  // ssh-keygen -t $DEFAULT_KEY_TYPE -f ${defaultPrivateKeyPath()} -N '' -c "Minifolio SSH key"
  // NOTE: While cross-spawn (dependency of child-process-promise) is technically vulnerable to a
  // ReDoS attack, this is fine here, since the arguments are controlled by us
  await spawn(
    'ssh-keygen',
    [
      '-t',
      DEFAULT_KEY_TYPE,
      '-f',
      defaultPrivateKeyPath(),
      '-N',
      '',
      '-C',
      `${APP_NAME} SSH key`,
    ],
    { capture: ['stdout', 'stderr'] }
  );
  // Public key is definitely not null now
  return getPublicKey() as Promise<string>;
}
