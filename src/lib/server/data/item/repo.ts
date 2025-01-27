/**
 * Type definitions for links to repos
 */

import { supportedRepoProviders } from '$lib/repoInfo';
import { enums, literal, object, optional, string, union, type Infer } from 'superstruct';

export const RepoProviderStruct = enums(supportedRepoProviders);

export type RepoProvider = Infer<typeof RepoProviderStruct>;

/** Repository info gathered using provider definition */
const ProviderRepoInfoStruct = object({
  /** The provider of the repo (eg "github") */
  provider: RepoProviderStruct,
  /** The repo's slug within the provider (eg MaddyGuthridge/portfolio) */
  path: string(),
});

/** Repository info gathered using provider definition */
export type ProvidedRepoInfo = Infer<typeof ProviderRepoInfoStruct>;

/** Repository info set manually */
const ManualRepoInfoStruct = object({
  /** Provider is literally 'custom' */
  provider: literal('custom'),
  /** Title text to display for the repo */
  title: string(),
  /** Subtitle text to display for the repo */
  subtitle: string(),
  /** URL to link to */
  url: string(),
  /** Icon to use on the card (from LineAwesome) */
  icon: optional(string()),
});

/** Repository info set manually */
export type ManualRepoInfo = Infer<typeof ManualRepoInfoStruct>;

/** Information about a repo */
export const RepoInfoStruct = union([
  /** Repository info gathered using provider definition */
  ProviderRepoInfoStruct,
  /** Manual repo, with manually set properties */
  ManualRepoInfoStruct,
]);

/** Information about a repo */
export type RepoInfo = ProvidedRepoInfo | ManualRepoInfo;
