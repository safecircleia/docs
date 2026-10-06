import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // The design system is ported from sc-dashboard, which lints without these React Compiler rules.
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      '@next/next/no-img-element': 'off', // avatars are canvas/blob images
    },
  },
  globalIgnores([
    '.*/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Superseded by the dashboard-style shell; left in place until they are deleted.
    'layouts/**',
    'components/docs-sidebar/**',
    'components/toc/**',
    'components/ai/**',
    'components/ui/button.tsx',
    'components/ui/collapsible.tsx',
    'components/ui/popover.tsx',
    'components/ui/scroll-area.tsx',
  ]),
]);

export default eslintConfig;
