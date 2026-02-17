import { defineConfig, globalIgnores } from 'eslint/config'

import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Must be the last rule set.
  prettier,

  globalIgnores(['.next/**', 'build/**', 'out/**', 'next-env.d.ts']),
])

export default eslintConfig
