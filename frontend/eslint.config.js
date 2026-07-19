import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: [
            'dist',
            'node_modules',
            'src/types/generated.ts',
            'src/types/operations.ts',
            'src/gql/operations.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'jsx-a11y/alt-text': 'warn',
            'jsx-a11y/no-autofocus': 'warn',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    prettier,
);
