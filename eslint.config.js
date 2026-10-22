import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

const sharedUiRules = [
    {
        selector: "JSXOpeningElement[name.name='button']",
        message: "Use the shared Button primitive.",
    },
    {
        selector: "JSXAttribute[name.name='style']",
        message: "Use CSS Modules and shared design tokens.",
    },
];

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: { "no-console": "error" },
    },
    {
        files: ["src/context/AuthContext.jsx", "src/context/LanguageContext.jsx"],
        rules: {
            "react-refresh/only-export-components": [
                "error",
                {
                    allowConstantExport: true,
                    allowExportNames: ["AuthContext", "LanguageContext"],
                },
            ],
        },
    },
    {
        files: ["src/**/*.jsx"],
        ignores: ["src/components/common/buttons/Button/Button.jsx"],
        rules: { "no-restricted-syntax": ["error", ...sharedUiRules] },
    },
    {
        files: ["src/components/**/*.jsx"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["**/services/**", "**/api/**"],
                            message:
                                "Keep API communication in services and hooks; pass actions to presentation components.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/pages/**/*.jsx"],
        rules: {
            "no-restricted-syntax": [
                "error",
                ...sharedUiRules,
                {
                    selector: "CallExpression[callee.property.name='map']",
                    message:
                        "Move collection rendering to a paired List/ListItem or data transformations to a utility.",
                },
                {
                    selector: "JSXOpeningElement[name.name=/^(form|input|textarea|select|Input)$/]",
                    message: "Keep fields in an isolated form component.",
                },
                {
                    selector:
                        "ReturnStatement > JSXElement > JSXOpeningElement:not([name.name='Page']):not([name.name='Navigate'])",
                    message: "Wrap each visible page in the shared Page layout.",
                },
            ],
        },
    },
    {
        files: ["src/**/*.jsx"],
        ignores: [
            "src/**/*List*.jsx",
            "src/**/*Tabs*.jsx",
            "src/pages/**/*.jsx",
            "src/components/common/buttons/Button/Button.jsx",
        ],
        rules: {
            "no-restricted-syntax": [
                "error",
                ...sharedUiRules,
                {
                    selector:
                        "CallExpression[callee.property.name='map'] > ArrowFunctionExpression JSXElement",
                    message: "Extract collection markup into paired List and ListItem components.",
                },
            ],
        },
    },
]);
