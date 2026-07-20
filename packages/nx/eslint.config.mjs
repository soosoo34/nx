import { baseConfig } from '../../eslint.config.mjs';
import * as jsoncEslintParser from 'jsonc-eslint-parser';

// A later block configuring the same rule replaces its options wholesale, so
// the scoped migrate blocks below must restate these repo-wide restrictions.
const tsRestrictedImportPaths = [
  {
    name: 'typescript',
    message:
      'TypeScript is an optional dependency for Nx. If you need to use it, make sure its installed first with ensureTypescript.',
    allowTypeImports: true,
  },
];

const tsRestrictedImportPatterns = [
  {
    group: ['nx/*'],
    message: "Circular import in 'nx' found. Use relative path.",
  },
  {
    group: ['**/native-bindings', '**/native-bindings.js'],
    message:
      'Direct imports from native-bindings.js are not allowed. Import from index.js instead.',
  },
];

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'fs-extra',
              message:
                'Please use equivalent utilities from `node:fs` instead.',
            },
            {
              name: 'chalk',
              message:
                'Please use `picocolors` instead. For an orange color, import `orange` from `utils/output`.',
            },
          ],
          patterns: [
            {
              group: ['**/devkit-exports'],
              message: 'Do not import from devkit-exports from the nx package',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: tsRestrictedImportPaths,
          patterns: tsRestrictedImportPatterns,
        },
      ],
    },
    ignores: ['**/*.spec.ts'],
  },
  {
    // migrate/run/ owns the durable run-state format. The ignores exempt
    // spec files (as the sibling import-boundary blocks do), run/ itself
    // (importing its own modules directly is the normal intra-directory
    // pattern, and it takes the engine directly because importing
    // migrate.ts from run/ would invert the boundary) and migrate.ts,
    // which imports execute-migration directly to be the module that
    // re-exports it.
    files: ['src/command-line/migrate/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: tsRestrictedImportPaths,
          patterns: [
            ...tsRestrictedImportPatterns,
            {
              // Depth-independent: matches './run/*' from migrate/ itself and
              // '../run/*', '../../run/*', ... from any nested subtree.
              group: ['**/run/*'],
              message:
                "Import migrate/run's public surface from its barrel (the run directory index), not its internal modules directly.",
            },
            {
              group: ['**/execute-migration', '**/execute-migration.js'],
              message:
                'Import the execution engine through the migrate module, which re-exports its whole surface.',
            },
          ],
        },
      ],
    },
    ignores: ['**/*.spec.ts', '**/migrate.ts', '**/migrate/run/**'],
  },
  {
    files: ['src/command-line/migrate/run/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: tsRestrictedImportPaths,
          patterns: [
            ...tsRestrictedImportPatterns,
            {
              group: ['**/migrate', '**/migrate.js'],
              message:
                "Importing migrate.ts from migrate/run closes an import cycle: migrate.ts already imports run's barrel. Import the shared helper modules under migrate/ directly instead.",
            },
          ],
        },
      ],
    },
    ignores: ['**/*.spec.ts'],
  },
  {
    files: ['./package.json', './executors.json', './migrations.json'],
    rules: {
      '@nx/nx-plugin-checks': [
        'error',
        {
          allowedVersionStrings: ['latest'],
        },
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    files: ['nxw.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*', '!fs'],
              message:
                'The Nx wrapper is ran before packages are installed. It should only import node builtins.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      'no-restricted-modules': [
        'error',
        {
          patterns: ['*', '!fs', '!path', '!child_process', '!node:*'],
        },
      ],
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['./package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build-base'],
          ignoredDependencies: [
            'nx',
            'typescript',
            '@nrwl/angular',
            '@angular-devkit/build-angular',
            '@angular/build',
            '@angular-devkit/core',
            '@angular-devkit/architect',
            '@swc/core',
            '@swc/node-register',
            'rxjs',
            '@angular-devkit/schematics',
            '@pnpm/lockfile-types',
            '@nestjs/cli',
            'ts-node',
            'memfs',
            'events',
            'process',
            'prettier',
            'util',
            '@nx/nx-darwin-x64',
            '@nx/nx-darwin-arm64',
            '@nx/nx-linux-x64-gnu',
            '@nx/nx-linux-x64-musl',
            '@nx/nx-win32-x64-msvc',
            '@nx/nx-linux-arm64-gnu',
            '@nx/nx-linux-arm64-musl',
            '@nx/nx-linux-arm-gnueabihf',
            '@nx/nx-win32-arm64-msvc',
            '@nx/nx-freebsd-x64',
            '@nx/powerpack-license',
            '@nx/key',
            '@nx/powerpack-conformance',
            '@nx/conformance',
            '@nx/docker',
            '@napi-rs/wasm-runtime',
            'enhanced-resolve',
          ],
        },
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    ignores: ['**/__fixtures__/**/*', 'dist', 'native-packages/**/*'],
  },
];
