import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat configs (arrays of config objects),
// so they are spread directly instead of via FlatCompat (Next 16 also removed
// `next lint`, so the lint script now invokes the ESLint CLI).
const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "node_modules/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // react-hooks v7 (bundled with eslint-config-next 16) adds React-Compiler-
    // oriented rules that flag pre-existing, runtime-correct patterns. Keep them
    // as warnings so the upgrade lands without rewriting/behaviorally changing
    // working code; they remain visible for incremental cleanup.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
