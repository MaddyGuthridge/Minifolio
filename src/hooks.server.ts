import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import logger from './middleware/logger';
import banMiddleware from './middleware/bans';
import { migrateAll } from '$lib/server/data/migrations';

const middleware: Handle[] = [];

middleware.push(banMiddleware);
middleware.push(logger());

export const handle = sequence(...middleware);

/** Called when the server starts */
async function onStartup() {
  try {
    await migrateAll();
  } catch (e) {
    console.error('Error in startup hooks!');
    console.error(e);
    return;
  }
}

void onStartup();
