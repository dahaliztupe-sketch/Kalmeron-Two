import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

const rawPort = process.env.PORT ?? "23636";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/__mockup/";

async function loadTailwindPlugin() {
  try {
    const m = await import("@tailwindcss/vite");
    return m.default();
  } catch {
    try {
      const m = await import("tailwindcss/vite" as string);
      return (m as { default: () => unknown }).default();
    } catch {
      return null;
    }
  }
}

async function loadRuntimeErrorOverlay() {
  try {
    const m = await import("@replit/vite-plugin-runtime-error-modal");
    return m.default();
  } catch {
    return null;
  }
}

async function loadCartographerPlugin() {
  try {
    const m = await import("@replit/vite-plugin-cartographer");
    return m.cartographer({ root: path.resolve(import.meta.dirname, "..") });
  } catch {
    return null;
  }
}

const tailwindPlugin = await loadTailwindPlugin();
const runtimeErrorPlugin = await loadRuntimeErrorOverlay();
const cartographerPlugin =
  process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    ? await loadCartographerPlugin()
    : null;

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    ...(tailwindPlugin ? [tailwindPlugin] : []),
    ...(runtimeErrorPlugin ? [runtimeErrorPlugin] : []),
    ...(cartographerPlugin ? [cartographerPlugin] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
