import path from 'path';

const eslintCommand = (filenames) =>
    `eslint --fix ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' ')}`;

const prettierCommand = (filenames) =>
    `prettier --write ${filenames.join(' ')}`;

const stylelintCommand = (filenames) =>
    `stylelint --allow-empty-input ${filenames.join(' ')}`;

const lintStagedConfig = {
    '*.{js,jsx,ts,tsx}': [prettierCommand, eslintCommand],
    '*.{css,scss}': [prettierCommand, stylelintCommand],
    '*.{json,md,html}': [prettierCommand]
};

export default lintStagedConfig;
