import { hashAndSalt } from '$lib/server/auth/passwords';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import { applyStruct } from '$lib/server/util';
import validate from '$lib/validate';
import { error, json } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { object, string } from 'superstruct';

const NewCredentials = object({
  newUsername: string(),
  oldPassword: string(),
  newPassword: string(),
});

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');
  const uid = await validateTokenFromRequest({ request, cookies });

  const local = await getLocalConfig();

  if (!local.auth) {
    throw Error('Unreachable');
  }

  const { newUsername, oldPassword, newPassword }
    = applyStruct(await request.json(), NewCredentials);

  if (hashAndSalt(local.auth[uid].password.salt, oldPassword) !== local.auth[uid].password.hash) {
    return error(403, 'Old password is incorrect');
  }

  validate.id('Username', newUsername);
  validate.password(newPassword);

  // Hash and salt new password
  const salt = nanoid();
  const hash = hashAndSalt(salt, newPassword);
  local.auth[uid].password = {
    hash,
    salt,
  };
  // Change the username
  local.auth[uid].username = newUsername;
  await setLocalConfig(local);

  return json({}, { status: 200 });
}
