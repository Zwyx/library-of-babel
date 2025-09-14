import { resources } from "@/i18n/i18n";

// Makes i18next's `t` function type-safe https://zwyx.dev/blog/typesafe-translations

declare module "i18next" {
	interface CustomTypeOptions {
		resources: (typeof resources)["en"];
	}
}
