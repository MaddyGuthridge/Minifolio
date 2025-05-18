/**
 * A blank configuration, used when the server has not been set up yet.
 */
import type { ItemData } from './server/data/item';
import { unixTime } from './util';

export const blankData: ItemData = {
  info: {
    name: 'Minifolio',
    shortName: null,
    description: '',
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: null,
    article: false,
    feed: false,
    color: '#ff00ff',
    icon: null,
    banner: null,
    children: [],
    filters: [],
    sections: [],
    seo: { description: null, keywords: [] },
  },
  readme: null,
  ls: [],
  children: {},
};
