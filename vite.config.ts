import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		sentryVitePlugin({
			org: "zwyx",
			project: "library-of-babel",
		}),
	],
	resolve: {
		alias: [
			{
				find: "@",
				replacement: "/src",
			},
		],
	},
	build: {
		outDir: "docs",
		sourcemap: true, // Sourcemaps are sent to Sentry but not included in the bundle
	},
});
