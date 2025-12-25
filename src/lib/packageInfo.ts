import type { ProvidedPackageInfo, PackageInfo } from '$lib/server/data/item/package';

/** Names of package repos that are supported by the system */
export const supportedPackageProviders = ['pypi', 'npm', 'docker'] as const;

export type PackageProvider = (typeof supportedPackageProviders)[number];

/** Info required to register a package provider */
type ProviderInfo = {
  /** Name of provider (eg Pypi) */
  name: string,
  /** Icon id to use (from LineAwesome) */
  icon: string,
  /** Return a URL for the repo given the package ID */
  makeUrl: (id: string) => string,
  /** Return a command to install the package with the given ID */
  makeInstallCmd: (id: string) => string,
};

export const packageProviders: Record<PackageProvider, ProviderInfo> = {
  // Pypi (Python)
  pypi: {
    name: 'PyPI',
    icon: 'lab la-python',
    makeUrl: id => `https://pypi.org/project/${id}`,
    makeInstallCmd: id => `pip install ${id}`,
  },
  // NPM (Node JS)
  npm: {
    name: 'NPM',
    icon: 'lab la-npm',
    makeUrl: id => `https://npmjs.com/package/${id}`,
    makeInstallCmd: id => `npm install ${id}`,
  },
  docker: {
    name: 'Docker Hub',
    icon: 'lab la-docker',
    makeUrl: id => `https://hub.docker.com/r/${id}`,
    makeInstallCmd: id => `docker pull ${id}`,
  },
};

/** Returns whether a package uses a provider */
export function packageIsWithProvider(packageInfo: PackageInfo): packageInfo is ProvidedPackageInfo {
  return packageInfo.provider !== 'custom';
}
