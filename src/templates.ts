import dedent from 'dedent'

import { getCurrentYarnVersion, getNpmPackageVersion } from './utils.js'

export interface TemplateOption {
  name: string
}

export const plainTemplates = async (o: TemplateOption) => {
  const { name } = o

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
        "build": "tsc"
      },
      "devDependencies": {
        "typescript": "^${await getNpmPackageVersion('typescript')}"
      },
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
