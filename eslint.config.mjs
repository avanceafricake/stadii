import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    // Architecture rules, enforced rather than reviewed.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            'No colour literals. Import the value from @stadii/design-tokens via the Tailwind theme.',
        },
        {
          selector: 'Identifier[name=/^(homeTeam|awayTeam|homeSide|awaySide)$/]',
          message:
            'An event has N participants with roles (ADR-0004). There is no home-vs-away axis.',
        },
        {
          selector: 'Identifier[name=/^(computeTotal|calculateFee|applyFee|computePrice)$/]',
          message:
            'The backend owns pricing, fees and totals (ADR-0001, ADR-0013). This surface renders stored money and never computes it.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase-admin',
              message: 'The public website holds no privileged credentials (ADR-0018).',
            },
            {
              name: 'firebase/functions',
              message:
                'This surface issues no commands. Purchase hands off to the authenticated app flow.',
            },
          ],
          patterns: [
            {
              group: ['firebase-admin/*'],
              message: 'The public website holds no privileged credentials (ADR-0018).',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];

export default config;
