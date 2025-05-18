import { boolean, string, type } from 'superstruct';

export const FeedOptionsStruct = type({
  /** Title to use for the feed */
  title: string(),
  /** Provider-specific options */
  providers: type({
    /** Whether to enable an RSS feed for this item */
    rss: boolean(),
    /** Whether to enable an Atom feed for this item */
    atom: boolean(),
  }),
});
