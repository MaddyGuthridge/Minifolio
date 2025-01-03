/**
 * Type definitions for published packages
 */

import { enums, literal, object, string, union, type Infer } from 'superstruct';

/** Names of package repos that are supported by the system */
export const supportedPackageRepos = ['pypi', 'npm'] as const;

export const PackageProviderStruct = enums(supportedPackageRepos);

export type PackageProvider = Infer<typeof PackageProviderStruct>;

/** Package info gathered using provider definition */
const ProviderPackageInfoStruct = object({
  /** The provider of the package repo (eg "pypi") */
  provider: PackageProviderStruct,
  /** The package name within the repo (eg "flapi") */
  id: string(),
});

/** Package info gathered using provider definition */
export type ProvidedPackageInfo = Infer<typeof ProviderPackageInfoStruct>;

/** Package info set manually */
const ManualPackageInfoStruct = object({
  provider: literal('custom'),
  /** Title text to display for the package repository (eg "PyPI") */
  providerName: string(),
  /** URL to link to */
  url: string(),
  /** Package installation command */
  command: string(),
  /** Icon to use on the card (from LineAwesome) */
  icon: string(),
});

/** Package info set manually */
export type ManualPackageInfo = Infer<typeof ManualPackageInfoStruct>;

/** Information about a package */
export const PackageInfoStruct = union([
  /** Package info gathered using provider definition */
  ProviderPackageInfoStruct,
  /** Manual package, with manually set properties */
  ManualPackageInfoStruct,
]);

/** Information about a package */
export type PackageInfo = ProvidedPackageInfo | ManualPackageInfo;
