import { hashAndSalt } from '$lib/server/auth/passwords';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import validate from '$lib/validate';
import { error, json } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import z from 'zod';

const NewCredentials = z.strictObject({
  newUsername: z.string(),
  oldPassword: z.string(),
  newPassword: z.string(),
});

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');
  const uid = await validateTokenFromRequest({ request, cookies });

  const local = await getLocalConfig();

  if (!local.auth) {
    throw Error('Unreachable');
  }

  const { newUsername, oldPassword, newPassword }
    = await NewCredentials.parseAsync(await request.json()).catch(e => error(400, e));

  if (hashAndSalt(local.auth[uid].password.salt, oldPassword) !== local.auth[uid].password.hash) {
    return error(403, 'Old password is incorrect');
  }

  await validate.idComponent.parseAsync(newUsername)
    .catch(e => error(400, e));
  await validate.password.parseAsync(newPassword)
    .catch(e => error(400, e));

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
