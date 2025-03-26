// We have tried to add type-checked rules (and TypeScript's `noUncheckedIndexedAccess`),
// but it would be a lot of effort which is not justified as development is mostly done.

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
	},
	extends: [
		"eslint:recommended",
		// Type-checked rules disabled – see above
		// "plugin:@typescript-eslint/strict-type-checked",
		"plugin:@typescript-eslint/strict",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/strict",
		"plugin:react-ref/recommended-legacy",
		"prettier",
	],
	plugins: ["react-refresh", "i18next", "only-warn"],
	// Type-checked rules disabled – see above
	// parserOptions: {
	// 	ecmaVersion: "latest",
	// 	sourceType: "module",
	// 	project: ["./tsconfig.json", "./tsconfig.node.json"],
	// 	tsconfigRootDir: __dirname,
	// },
	settings: {
		react: {
			version: "detect",
		},
	},
	ignorePatterns: [
		".eslintrc.cjs",
		"tailwind.config.js",
		"postcss.config.js",
		"/src/components/ui",
		"dev-dist",
		"docs",
	],
	reportUnusedDisableDirectives: true,
	rules: {
		// ---------- JavaScript ----------

		// Enforce consistent brace style for all control statements
		curly: "warn",

		// Require `===` when `==` can be ambiguous
		eqeqeq: ["warn", "always"],

		// Disallow the use of `console.log`, which helps not forget them after debugging; for permanent logging, use `console.info/warn/warn`
		"no-console": ["warn", { allow: ["info", "warn", "error"] }],

		// Disallow the use of `eval()`; if `eval()` is necessary, use `// eslint-disable-next-line no-eval` where it's needed
		"no-eval": "warn",

		// Disallow `new` operators with the `Function` object, as this is similar to `eval()`; if necessary, use `// eslint-disable-next-line no-new-func` where it's needed
		"no-new-func": "warn",

		// Disallow ternary operators when simpler alternatives exist; example: prevent `const x = y === 1 ? true : false` in favour of `const x = y === 1`
		"no-unneeded-ternary": "warn",

		// Disallow renaming import, export, and destructured assignments to the same name; example: prevent `const { a: a } = b;` in favour of `const { a } = b;`
		"no-useless-rename": "warn",

		// Disallow throwing anything else than the `Error object`
		"no-throw-literal": "warn",

		// Require method and property shorthand syntax for object literals; example: prevent `a = { b: b };` in favour of `a = { b };`
		"object-shorthand": "warn",

		// ---------- TypeScript ----------

		// Enforce consistent usage of type imports
		// Will activate when VS Code's feature "organise imports" manages that automatically
		// "@typescript-eslint/consistent-type-imports": "warn",

		// Disallow the declaration of empty interfaces, but allow to extend a single interface
		// Replaced by `@typescript-eslint/no-empty-object-type` in future versions (is in the recommended config)
		"@typescript-eslint/no-empty-interface": [
			"warn",
			{ allowSingleExtends: true },
		],

		// Disallow variable declarations from shadowing variables declared in the outer scope; necessitates to disable `no-shadow`, see https://typescript-eslint.io/rules/no-shadow
		"no-shadow": "off",
		"@typescript-eslint/no-shadow": "warn",

		// ---------- React ----------

		// Ensure React component can be updated with fast refresh
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],

		// TODO: remove this deactivation after translations are ready
		"react/no-unescaped-entities": "off",

		// ---------- i18next ----------

		// Warn when untranslated string are present in JSX
		// TODO: activate once translation ready "i18next/no-literal-string": "warn",
	},
};
