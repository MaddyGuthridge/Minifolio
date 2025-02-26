/**
 * A blank configuration, used when the server has not been set up yet.
 */
import type { ItemData } from './server/data/item';

export const blankData: ItemData = {
  info: {
    name: 'Minifolio',
    shortName: null,
    description: '',
    readme: null,
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
