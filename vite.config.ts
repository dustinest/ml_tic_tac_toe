import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base must match the GitHub repo name so the project-site URL resolves.
export default defineConfig({
  base: '/ml_tic_tac_toe/',
  plugins: [viteSingleFile()],
});
