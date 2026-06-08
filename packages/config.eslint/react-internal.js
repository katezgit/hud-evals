import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    // Forbid arbitrary Tailwind color/shadow/blur/radius bracket syntax in JSX.
    // Use a design-system token (bg-primary, shadow-card, rounded-control) or add a
    // primitive to packages/ui/src/styles/primitives/. For one-off CSS-var consumption,
    // use the v4 syntax: bg-(--my-var), NOT bg-[var(--my-var)].
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\b(bg|text|border|ring|fill|stroke|outline|divide|decoration|accent|caret|placeholder|from|via|to|shadow|blur|backdrop-blur|rounded)-\\[/]",
          message:
            "Arbitrary Tailwind values are forbidden. Use a design-system token (bg-primary, shadow-card, rounded-control) or add a token to packages/ui/src/styles/primitives/. The v4 syntax for one-off CSS-var consumption is bg-(--my-var), not bg-[var(--my-var)].",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\b(bg|text|border|ring|fill|stroke|outline|divide|decoration|accent|caret|placeholder|from|via|to|shadow|blur|backdrop-blur|rounded)-\\[/]",
          message:
            "Arbitrary Tailwind values are forbidden. Use a design-system token (bg-primary, shadow-card, rounded-control) or add a token to packages/ui/src/styles/primitives/. The v4 syntax for one-off CSS-var consumption is bg-(--my-var), not bg-[var(--my-var)].",
        },
      ],
    },
  },
];
