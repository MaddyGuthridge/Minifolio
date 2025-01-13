import fs from 'fs/promises';
import { error } from '@sveltejs/kit';
import mime from 'mime-types';
import { dataIsSetUp, getDataDir } from '$lib/server/data/dataDir';
import { getConfig } from '$lib/server/data/config';

export async function GET(req: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(404, 'Favicon not set up');
  }
  const config = await getConfig();
  const siteIcon = config.siteIcon;
  if (!siteIcon) {
    error(404, 'Favicon not set up');
  }
  // Get the path of the file to serve
  const filePath = `${getDataDir()}/${siteIcon}`;

  // Ensure file exists
  await fs.access(filePath, fs.constants.R_OK).catch(() => error(404));

  // Read the contents of the file
  const content = await fs.readFile(filePath);
  let mimeType = mime.contentType(siteIcon);
  if (!mimeType) {
    mimeType = 'text/plain';
  }

  req.setHeaders({
    'Content-Type': mimeType,
    'Content-Length': content.length.toString(),
  });

  return new Response(content);
}
