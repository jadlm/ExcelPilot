import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['AI_API_KEY', 'AI_MODEL', 'AI_API_URL']) {
    if (env[key]) process.env[key] = env[key];
  }
  return {
    optimizeDeps: { noDiscovery: true, include: [] },
  };
});
