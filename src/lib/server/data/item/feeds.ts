import z from 'zod';

export const FeedOptionsStruct = z.strictObject({
  /** Title to use for the feed */
  title: z.string(),
  /** Provider-specific options */
  providers: z.strictObject({
    /** Whether to enable an Atom feed for this item */
    atom: z.boolean(),
  }),
});
