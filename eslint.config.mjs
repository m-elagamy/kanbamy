import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import clerkNext from "@clerk/eslint-plugin/next";

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
  ]),
  {
    settings: {
      react: {
        version: "19.3.0",
      },
    },
    plugins: {
      "@clerk/next": clerkNext,
    },
    rules: {
      "no-duplicate-imports": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "debug"] }],
      "@clerk/next/require-auth-protection": [
        "error",
        {
          protected: ["src/app/dashboard/**", "src/app/welcome/**", "src/actions/**"],
          public: ["src/app/(auth)/**", "src/app/sso-callback/**"],
        },
      ],
    },
  },
]);

export default eslintConfig;
