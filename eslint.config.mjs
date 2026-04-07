export default [
    {
        files: ["src/module/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                console: "readonly",
                DOMParser: "readonly",
                HTMLElement: "readonly",
                setTimeout: "readonly",
                Promise: "readonly",
                // FoundryVTT globals
                game: "readonly",
                ui: "readonly",
                canvas: "readonly",
                CONFIG: "readonly",
                CONST: "readonly",
                Hooks: "readonly",
                foundry: "readonly",
                Handlebars: "readonly",
                ChatMessage: "readonly",
                Roll: "readonly",
                Dialog: "readonly",
                Macro: "readonly",
                Actor: "readonly",
                Item: "readonly",
                ActiveEffect: "readonly",
                MeasuredTemplateDocument: "readonly",
                renderTemplate: "readonly",
                mergeObject: "readonly",
                socketlib: "readonly",
                Babele: "readonly",
                $: "readonly",
                PIXI: "readonly",
                Color: "readonly",
                Ray: "readonly",
                TextEditor: "readonly",
                FormDataExtended: "readonly",
                ActiveEffectConfig: "readonly",
                SettingsConfig: "readonly",
                SortingHelpers: "readonly",
                Combat: "readonly",
                fromUuid: "readonly",
                fromUuidSync: "readonly",
                getProperty: "readonly",
                hasProperty: "readonly",
                duplicate: "readonly",
                math: "readonly",
            }
        },
        rules: {
            // Errors
            "no-undef": "error",
            "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^_" }],
            "no-dupe-keys": "error",
            "no-duplicate-case": "error",
            "no-unreachable": "warn",
            "no-constant-condition": "warn",

            // Style (warn only)
            "no-var": "warn",
            "prefer-const": "warn",
            "eqeqeq": ["warn", "smart"],
            "no-console": "off",
        }
    },
    {
        ignores: ["src/lib/**", "node_modules/**", "dist/**"]
    }
];
