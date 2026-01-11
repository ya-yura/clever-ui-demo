// === 📁 src/config/version.ts ===
// Application version configuration
// This file is the single source of truth for application version

export const APP_VERSION = '2.0.0';
export const APP_BUILD_DATE = '2025-01-11';
export const APP_NAME = 'Склад-15';
export const APP_VENDOR = 'Cleverence';

// Version info object
export const versionInfo = {
  version: APP_VERSION,
  buildDate: APP_BUILD_DATE,
  name: APP_NAME,
  vendor: APP_VENDOR,
  fullVersion: `${APP_NAME} v${APP_VERSION} (${APP_BUILD_DATE})`,
} as const;

