import { nextJsConfig } from "@repo/config.eslint/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
