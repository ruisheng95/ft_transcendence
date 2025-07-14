import { defineConfig } from "vite";
import path from "path";
import eslint from "vite-plugin-eslint2";
import checker from "vite-plugin-checker";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    base: "./",
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "build",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          gameonline: path.resolve(__dirname, "game-online/index.html"),
          gameindex: path.resolve(__dirname, "gameindex.html"),
        },
      },
    },
    plugins: [
      tailwindcss(),
      eslint(),
      checker({
        typescript: true,
      }),
    ],
    server: {
      allowedHosts: ["ft.ruisheng.me"],
    },
  };
});
