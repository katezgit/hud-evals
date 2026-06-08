import { config } from "@repo/config.eslint/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["storybook-static/**", "dist/**", ".turbo/**", "coverage/**"],
  },
];
