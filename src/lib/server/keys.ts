/** Code for managing the server's SSH keys */
import fs from 'fs/promises';
import { getPrivateDataDir } from './data/dataDir';
import { spawn } from 'child-process-promise';
import { APP_NAME } from '$lib/consts';

const KEY_TYPE = 'ed25519';

const publicKeyFile = () => `${getPrivateDataDir()}/id_${KEY_TYPE}.pub`;
const privateKeyFile = () => `${getPrivateDataDir()}/id_${KEY_TYPE}`;

let publicKey: string | undefined;

/** Returns the server's SSH public key */
export async function getPublicKey(): Promise<string> {
  if (publicKey) {
    return publicKey;
  }
  // Read the key from the disk
  const key = await fs.readFile(publicKeyFile(), { encoding: 'utf-8' })
    // If it fails, generate a new public key
    .catch(regenerateKey)
    .then(k => k.trim());
  publicKey = key;
  return key;
}

/** Regenerate the SSH key pair for the server */
export async function regenerateKey(): Promise<string> {
  publicKey = undefined;
  // Discard errors, since they mean the file already exists
  await fs.unlink(privateKeyFile()).catch(() => { });
  await fs.unlink(publicKeyFile()).catch(() => { });
  // Also need to create private data dir if it was removed
  await fs.mkdir(getPrivateDataDir()).catch(() => { });
  await spawn(
    'ssh-keygen',
    [
      '-t',
      KEY_TYPE,
      '-f',
      privateKeyFile(),
      '-N',
      '',
      '-C',
      `${APP_NAME} SSH key`,
    ],
    { capture: ['stdout', 'stderr'] }
  );
  return getPublicKey();
}
