import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import path from "path";

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  build: {
    target: 'esnext',
    outDir: './dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
