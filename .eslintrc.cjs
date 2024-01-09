/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended-type-checked",
		"plugin:@typescript-eslint/stylistic-type-checked",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		"prettier",
	],
	plugins: ["react-refresh", "i18next", "only-warn"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		project: ["./tsconfig.json", "./tsconfig.node.json"],
		tsconfigRootDir: __dirname,
	},
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

		// The use of `@typescript-eslint/no-shadow` necessitates to disable `no-shadow`, see https://typescript-eslint.io/rules/no-shadow
		"no-shadow": "off",

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
		// Maybe later, VS Code automatic support isn't great; "@typescript-eslint/consistent-type-imports": "warn",

		// Disallow the declaration of empty interfaces, but allow to extend a single interface
		"@typescript-eslint/no-empty-interface": [
			"warn",
			{ allowSingleExtends: true },
		],

		// Disallow non-null assertions using the `!` postfix operator
		"@typescript-eslint/no-non-null-assertion": "warn",

		// Disallow variable declarations from shadowing variables declared in the outer scope
		"@typescript-eslint/no-shadow": "warn",

		// Enforce using the nullish coalescing operator instead of logical assignments or chaining
		"@typescript-eslint/prefer-nullish-coalescing": [
			"warn",
			{
				// `a || b` and `a ?? b` doesn't have the same signification if `a` is of type `boolean | undefined`
				ignorePrimitives: true,
			},
		],

		// ---------- React ----------

		// Ensure React component can be updated with fast refresh
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],

		// ---------- i18next ----------

		// Warn when untranslated string are present in JSX
		// TODO: activate once translation ready "i18next/no-literal-string": "warn",
	},
};
