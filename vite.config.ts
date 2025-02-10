import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			devOptions: {
				// enabled: true,
			},
			registerType: "prompt",
			manifestFilename: "manifest.json",
			manifest: {
				name: "The Library of Babel",
				short_name: "Babel",
				description: "Explore all the books.",
				categories: ["books", "concepts", "experiments"],
				display: "standalone",
				handle_links: "preferred",
				theme_color: "#020817",
				background_color: "#020817",
				icons: [
					{
						src: "manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			includeAssets: ["favicon-196.png", "apple-icon-180.png"],
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
	},
});
