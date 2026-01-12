/**
 * Type definitions for links to repos
 */

import { supportedRepoProviders } from '$lib/repoInfo';
import z from 'zod';

export const RepoProviderStruct = z.enum(supportedRepoProviders);

export type RepoProvider = z.infer<typeof RepoProviderStruct>;

/** Repository info gathered using provider definition */
const ProviderRepoInfo = z.strictObject({
  /** The provider of the repo (eg "github") */
  provider: RepoProviderStruct,
  /** The repo's slug within the provider (eg MaddyGuthridge/portfolio) */
  path: z.string().nonempty(),
});

/** Repository info gathered using provider definition */
export type ProvidedRepoInfo = z.infer<typeof ProviderRepoInfo>;

/** Repository info set manually */
const ManualRepoInfo = z.strictObject({
  /** Provider is literally 'custom' */
  provider: z.literal('custom'),
  /** Title text to display for the repo */
  title: z.string(),
  /** Subtitle text to display for the repo */
  subtitle: z.string(),
  /** URL to link to */
  url: z.url(),
  /** Icon to use on the card (from LineAwesome) */
  icon: z.string().nullable(),
});

/** Repository info set manually */
export type ManualRepoInfo = z.infer<typeof ManualRepoInfo>;

/** Information about a repo */
export const RepoInfo = z.discriminatedUnion('provider', [
  /** Repository info gathered using provider definition */
  ProviderRepoInfo,
  /** Manual repo, with manually set properties */
  ManualRepoInfo,
]);

/** Information about a repo */
export type RepoInfo = z.infer<typeof RepoInfo>;
