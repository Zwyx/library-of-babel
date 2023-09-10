module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		"prettier",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["react-refresh"],
	settings: {
		react: {
			version: "detect",
		},
	},
	ignorePatterns: ["/src/components/ui"],
	overrides: [
		{
			files: [".eslintrc.{js,cjs}"],
			env: {
				node: true,
			},
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	rules: {
		// ---------- JavaScript ----------

		// Enforce consistent brace style for all control statements
		curly: "error",

		// Require `===` when `==` can be ambiguous
		eqeqeq: ["error", "always"],

		// Disallow the use of `console.log`, which helps not forget them after debugging; for permanent logging, use `console.info/warn/error`
		"no-console": ["warn", { allow: ["info", "warn", "error"] }],

		// Disallow the use of `debugger`
		"no-debugger": "warn",

		// Disallow the use of `eval()`; if `eval()` is necessary, use `// eslint-disable-next-line no-eval` where it's needed
		"no-eval": "error",

		// Disallow `new` operators with the `Function` object, as this is similar to `eval()`; if necessary, use `// eslint-disable-next-line no-new-func` where it's needed
		"no-new-func": "error",

		// The use of `@typescript-eslint/no-shadow` necessitates to disable `no-shadow`, see https://typescript-eslint.io/rules/no-shadow
		"no-shadow": "off",

		// Disallow ternary operators when simpler alternatives exist; example: prevent `const x = y === 1 ? true : false` in favour of `const x = y === 1`
		"no-unneeded-ternary": "warn",

		// Disallow renaming import, export, and destructured assignments to the same name; example: prevent `const { a: a } = b;` in favour of `const { a } = b;`
		"no-useless-rename": "warn",

		// Disallow throwing anything else than the `Error object`
		"no-throw-literal": "error",

		// Require method and property shorthand syntax for object literals; example: prevent `a = { b: b };` in favour of `a = { b };`
		"object-shorthand": "warn",

		// ---------- TypeScript ----------

		// Enforce consistent usage of type imports
		// Maybe later, VS Code automatic support isn't great; "@typescript-eslint/consistent-type-imports": "error",

		// Disallow the declaration of empty interfaces, but allow to extend a single interface
		"@typescript-eslint/no-empty-interface": [
			"error",
			{ allowSingleExtends: true },
		],

		// Disallow non-null assertions using the `!` postfix operator
		"@typescript-eslint/no-non-null-assertion": "error",

		// Disallow variable declarations from shadowing variables declared in the outer scope
		"@typescript-eslint/no-shadow": "warn",

		// ---------- React ----------

		// Not necessary in a Vite project
		"react/react-in-jsx-scope": "off",

		// Check effect dependencies — https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect
		"react-hooks/exhaustive-deps": "error",

		// Check rules of Hooks — https://reactjs.org/docs/hooks-rules.html
		"react-hooks/rules-of-hooks": "error",

		// Check that components allow fast refresh
		"react-refresh/only-export-components": "warn",
	},
};
