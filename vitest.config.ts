import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The clock is pinned so that "is this event upcoming" and the
    // Africa/Nairobi rendering assertions are not date-dependent.
    env: {
      TZ: 'UTC',
      NEXT_PUBLIC_SITE_URL: 'https://stadii.co.ke',
    },
  },
});
