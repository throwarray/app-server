module.exports = {
	env: {
		'browser': true,
		'es6': true,
		'node': true
	},
	settings: {
		react: {
			version: 'detect'
		}
	},
	extends: [ 
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended'
		//'plugin:@typescript-eslint/recommended-requiring-type-checking'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		'sourceType': 'module',
		'ecmaVersion':8,
		'ecmaFeatures': {
			'jsx': true,
			'experimentalObjectRestSpread': true
		}
	},
	plugins: [
		'@typescript-eslint',
		'react',
		'react-hooks'
	],
	overrides: [
		{
			// enable the rule specifically for TypeScript files
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': ['warn']
			}
		}
	],
	rules: {
		'react/react-in-jsx-scope': 0,
		'react/display-name': 0,
		'react/prop-types': 0,
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/explicit-member-accessibility': 0,
		'@typescript-eslint/indent': 0,
		'@typescript-eslint/member-delimiter-style': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-var-requires': 0,
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				'ignoreRestSiblings': true,
				'argsIgnorePattern': '^_'
			}
		],
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/jsx-uses-react': 'error',
		'react/jsx-uses-vars': 'error',
		'no-console': [ 0 ],
		'quotes': [ 'error', 'single' ],
		'semi': [ 'warn', 'never' ]
		// 'react/jsx-filename-extension': [1, { 'extensions': ['.mjs', '.js', '.jsx', '.ts', '.tsx'] }],
		// 'indent': [ 'warn', 'tab' ],
		// 'no-unused-vars': [ 'warn', { 'ignoreRestSiblings': true }],
	}
}