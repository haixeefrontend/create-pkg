import dedent from 'dedent'

import { getCurrentYarnVersion, getNpmPackageVersion } from './utils.js'

export interface TemplateOption {
  name: string
  scripts?: Record<string, string>
  extraDeps?: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
}

export const plainTemplates = async (o: TemplateOption) => {
  const {
    name,
    scripts = { build: 'tsc' },
    extraDeps = {
      devDependencies: {
        typescript: `^${await getNpmPackageVersion('typescript')}`,
      },
    },
  } = o

  const depsLine = (name: string, deps: Record<string, string>) => {
    if (!deps || Object.keys(deps).length === 0) {
      return ''
    }
    return `
    "${name}": {
      ${Object.entries(deps).map(([key, value]) => `"${key}": "${value}"`).join(',\n' + ' '.repeat(8))}
    }`
  }

  const depsStr = Object.entries(extraDeps).map(([name, deps]) => depsLine(name, deps)).join(',\n' + ' '.repeat(6))

  return {
    'package.json': dedent`{
      "name": "${name}",
      "description": "",
      "version": "0.0.0",
      "type": "module",
      "main": "dist/index.cjs",
      "module": "dist/index.js",
      "types": "dist/index.d.ts",
      "exports": {
        ".": {
          "types": "./dist/index.d.ts",
          "import": "./dist/index.js",
          "require": "./dist/index.cjs",
          "default": "./dist/index.js"
        },
        "./package.json": "./package.json"
      },
      "scripts": {
        ${Object.entries(scripts).map(([key, value]) => `"${key}": "${value}"`).join(',\n' + ' '.repeat(8))}
      },
      ${depsStr},
      "packageManager": "yarn@${await getCurrentYarnVersion()}"
    }`,
    'tsconfig.json': dedent`{
      "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "Node",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      },
      "include": ["src"]
    }`,
    'src/index.ts': dedent`console.log('Hello, world!')`,
  }
}
