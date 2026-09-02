import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ponytail: this app's JSX lives in .js files, a Create React App habit that
  // esbuild does not assume. Teaching it the loader beats renaming 47 files;
  // do the rename if the extra parse cost ever shows up in a cold start.
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },

  // Same port CRA used, and the origin the backend's CORS_ORIGINS allows.
  server: { port: 3000 },

  // Keep CRA's output directory so the Dockerfile and nginx config still apply.
  build: { outDir: "build" },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
