import type { ProvidedPackageInfo, PackageProvider, PackageInfo } from '$lib/server/data/item/package';

/** Info required to register a package provider */
type ProviderInfo = {
  /** Name of provider (eg Pypi) */
  name: string
  /** Icon id to use (from LineAwesome) */
  icon: string
  /** Return a URL for the repo given the package ID */
  makeUrl: (id: string) => string
  /** Return a command to install the package with the given ID */
  makeInstallCmd: (id: string) => string
}

export const packageProviders: Record<PackageProvider, ProviderInfo> = {
  // Pypi (Python)
  pypi: {
    name: 'PyPI',
    icon: 'lab la-python',
    makeUrl: (id: string): string => `https://pypi.org/project/${id}`,
    makeInstallCmd: (id: string): string => `pip install ${id}`,
  },
  // NPM (Node JS)
  npm: {
    name: 'NPM',
    icon: 'lab la-npm',
    makeUrl: (id: string): string => `https://npmjs.com/package/${id}`,
    makeInstallCmd: (id: string): string => `npm install ${id}`,
  }
};

/** Returns whether a package uses a provider */
export function packageIsWithProvider(repo: PackageInfo): repo is ProvidedPackageInfo {
  return 'provider' in repo;
}
