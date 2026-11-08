import { execSync } from 'node:child_process';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Pre-restructure URLs -> where the page lives now.
const MOVED = {
  'getting-started/sign-up': 'platform/private-beta/join',
  'getting-started/parent-dashboard': 'platform/dashboard/setup',
  'getting-started/child-app': 'platform/android/setup',
  'using-safecircle/alerts': 'platform/dashboard/alerts',
  'using-safecircle/notifications': 'platform/dashboard/notifications',
};

function gitSha() {
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'dev'; }
}

// Baseline response headers. No full CSP yet (Next inlines scripts); frame-ancestors alone closes clickjacking.
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: { root: import.meta.dirname },
  // Next generates AGENTS.md/CLAUDE.md on dev start; this repo does not track them.
  agentRules: false,
  env: { NEXT_PUBLIC_BUILD_ID: gitSha(), NEXT_PUBLIC_BUILT_AT: new Date().toISOString() },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return Object.entries(MOVED).flatMap(([from, to]) =>
      ['en', 'es'].map((lang) => ({ source: `/${lang}/docs/${from}`, destination: `/${lang}/docs/${to}`, permanent: true })),
    );
  },
};

export default withMDX(config);
