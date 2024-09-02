import fs from 'fs/promises';
import { error } from '@sveltejs/kit';
import mime from 'mime-types';
import { getDataDir } from '$lib/server/data/dataDir.js';
import { getPortfolioGlobals } from '$lib/server/index.js';

export async function GET({ setHeaders }) {
  const globals = await getPortfolioGlobals();

  const siteIcon = globals.config.siteIcon;
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

  setHeaders({
    'Content-Type': mimeType,
    'Content-Length': content.length.toString(),
  });

  return new Response(content);
}