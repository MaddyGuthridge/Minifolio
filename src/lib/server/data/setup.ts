/**
 * Code for setting up public data.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { runSshKeyscan, setupGitRepo, urlRequiresSsh } from '../git';
import { dataIsSetUp, getDataDir } from './dataDir';
import { initConfig } from './config';
import { error } from '@sveltejs/kit';
import { itemPath, setItemInfo } from './item';
import { randomColor } from '$lib/color';
import { LANDING_README } from './text';
import consts from '$lib/consts';
import itemId from '$lib/itemId';
import { migrateData } from './migrations';
import { unixTime } from '$lib/util';

/**
 * Set up the data directory.
 *
 * This returns whether it is the data is new (ie the git repo is empty, or git
 * isn't in use).
 */
export async function setupData(repoUrl?: string, branch?: string): Promise<boolean> {
  // If we were given a repoUrl, set it up
  if (repoUrl) {
    if (urlRequiresSsh(repoUrl)) {
      await runSshKeyscan(repoUrl);
    }
    await setupGitRepo(repoUrl, branch);
    // Migrate data if needed
    await migrateData();
  } else {
    // Otherwise, just create the data dir empty
    // Discard errors for this, as the dir may already exist
    await mkdir(getDataDir(), { recursive: true }).catch(() => { });
  }

  /**
   * Whether the data repo is empty -- true if data dir was empty before
   * firstrun.
   */
  let firstTime = false;

  // If data dir is empty, set up default configuration
  if (!await dataIsSetUp()) {
    firstTime = true;
    await initConfig();
    // Also set up the root item
    await setItemInfo(itemId.ROOT, {
      name: consts.APP_NAME,
      shortName: null,
      description: `A portfolio website, created using ${consts.APP_NAME}`,
      timeCreated: unixTime(),
      timeEdited: unixTime(),
      readme: 'README.md',
      article: false,
      rss: false,
      icon: null,
      banner: null,
      color: randomColor(),
      sections: [],
      children: [],
      filters: [],
      seo: {
        description: null,
        keywords: []
      }
    });
    await writeFile(itemPath(itemId.ROOT, 'README.md'), LANDING_README);
  }

  try {
    // TODO: Validate data
  } catch (e) {
    console.log(e);
    error(400, `Error loading data: ${e}`);
  }

  return firstTime;
}
