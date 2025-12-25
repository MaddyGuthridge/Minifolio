import fs from 'node:fs/promises';
import path from 'node:path';

import { dataIsSetUp, getPrivateDataDir } from '$lib/server/data/dataDir';
import { error, json, text } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth';
import { fileExists } from '$lib/server/util';
type Request = import('./$types').RequestEvent;

function robotsFile() {
  return path.join(getPrivateDataDir(), 'robots.txt');
}

export async function GET() {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  const filePath = robotsFile();
  await fs.access(filePath, fs.constants.R_OK).catch(() => error(404));

  return text(await fs.readFile(filePath, 'utf-8'));
}

export async function POST(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest(req);
  const filePath = robotsFile();
  if (await fileExists(filePath)) {
    error(400, 'robots.txt already exists');
  }
  await fs.writeFile(filePath, await req.request.text(), { encoding: 'utf-8' });
  return json({});
}

export async function PUT(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  const filePath = robotsFile();
  await fs.access(filePath, fs.constants.R_OK).catch(() => error(404));
  await validateTokenFromRequest(req);
  await fs.writeFile(filePath, await req.request.text(), { encoding: 'utf-8' });
  return json({});
}

export async function DELETE(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  const filePath = robotsFile();
  await fs.access(filePath, fs.constants.R_OK).catch(() => error(404));

  await validateTokenFromRequest(req);

  await fs.unlink(filePath);
  return json({});
}
