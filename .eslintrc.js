module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": [ 
		"eslint:recommended"
		// "plugin:react/recommended"
	],
	"parser": "babel-eslint",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion":8,
		"ecmaFeatures": {
			"jsx": true,
			"experimentalObjectRestSpread": true
		}
	},
	"plugins": [ 
		"react",
		"react-hooks"
	],
	"rules": {
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"react/jsx-uses-react": "error",
		"react/jsx-uses-vars": "error",
		// "indent": [ "error", "tab" ],
		"no-unused-vars": [ "warn", { "ignoreRestSiblings": true }],
		"no-console": [ 0 ],
		"quotes": [ "error", "single" ],
		"semi": [ "warn", "never" ]
	}
};