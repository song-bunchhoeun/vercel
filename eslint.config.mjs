import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended
});

const eslintConfig = [
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts'
        ]
    },
    ...compat.extends(
        'eslint:recommended',
        'next/core-web-vitals',
        'prettier',
        'next/typescript'
    ),
    {
        plugins: {
            'unused-imports': unusedImports
        },
        rules: {
            'unused-imports/no-unused-imports': 'error'
        }
    }
];

export default eslintConfig;
