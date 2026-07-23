import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // En Windows + Vitest 4 / Vite 8, el pool por defecto falla al resolver
    // el runner (`Cannot read properties of undefined (reading 'config')`).
    pool: "vmThreads",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "app/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Alias estable: con pool vmThreads, vi.mock de este paquete no se aplica.
      "@marsidev/react-turnstile": path.resolve(__dirname, "src/test/mocks/turnstile.tsx"),
    }
  }
});
