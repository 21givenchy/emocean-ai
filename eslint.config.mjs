import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party sensor bundles. These are vendored builds, not our source —
    // linting them yields ~2,000 findings we cannot act on and drowns real ones.
    "public/vendor/**",
    "app/lib/sensors/vendor/**",
    "public/face-api.min.js",
  ]),
]);

export default eslintConfig;
