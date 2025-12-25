/**
 * Type definitions for published packages
 */

import { supportedPackageProviders } from '$lib/packageInfo';
import z from 'zod';

/** Package info gathered using provider definition */
const ProviderPackageInfo = z.object({
  /** The provider of the package repo (eg "pypi") */
  provider: z.enum(supportedPackageProviders),
  /** The package name within the repo (eg "flapi") */
  id: z.string().nonempty(),
});

/** Package info gathered using provider definition */
export type ProvidedPackageInfo = z.infer<typeof ProviderPackageInfo>;

/** Package info set manually */
const ManualPackageInfoStruct = z.strictObject({
  provider: z.literal('custom'),
  /** Title text to display for the package repository (eg "PyPI") */
  providerName: z.string().nonempty(),
  /** URL to link to */
  url: z.url(),
  /** Package installation command */
  command: z.string().nonempty(),
  /** Icon to use on the card (from LineAwesome) */
  icon: z.string().nullable(),
});

/** Package info set manually */
export type ManualPackageInfo = z.infer<typeof ManualPackageInfoStruct>;

/** Information about a package */
export const PackageInfoStruct = z.discriminatedUnion('provider', [
  /** Package info gathered using provider definition */
  ProviderPackageInfo,
  /** Manual package, with manually set properties */
  ManualPackageInfoStruct,
]);

/** Information about a package */
export type PackageInfo = ProvidedPackageInfo | ManualPackageInfo;
