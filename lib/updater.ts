import pkg from '../package.json';

/** Build identity shown in Settings. The docs have no updater; the version comes from package.json. */
export const BUILD = {
  version: pkg.version,
  codename: 'Docs',
  buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev',
  builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? new Date(0).toISOString(),
};
