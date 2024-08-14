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
    return dedent(`
      "${name}": {
        ${Object.entries(deps)
          .map(([key, value]) => `"${key}": "${value}"`)
          .join(',\n' + ' '.repeat(8))}
      }
    `)
  }

  const depsStr = Object.entries(extraDeps)
    .map(([name, deps]) => depsLine(name, deps))
    .join(',\n')

  return {
    'package.json': dedent(`
      {
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
        "scripts": {\n${Object.entries(scripts)
          .map(([key, value]) => `"${key}": "${value}"`)
          .join(',\n')
          .replace(/^/gm, ' '.repeat(10))}
        },\n${depsStr.replace(/^/gm, ' '.repeat(8))},
        "packageManager": "yarn@${await getCurrentYarnVersion()}"
      }
    `),
    'tsconfig.json': dedent(`
      {
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
      }
    `),
    'src/index.ts': dedent(`console.log('Hello, world!')`),
  }
}

export const viteTemplates = async (o: TemplateOption) => {
  const no = JSON.parse(JSON.stringify(o))
  no.extraDeps ??= {}
  no.extraDeps.devDependencies ??= {}
  no.extraDeps.devDependencies['vite'] = `^${await getNpmPackageVersion('vite')}`
  no.extraDeps.devDependencies['vite-plugin-dts'] = `^${await getNpmPackageVersion('vite-plugin-dts')}`
  no.extraDeps.devDependencies['typescript'] = `^${await getNpmPackageVersion('typescript')}`
  no.scripts ??= {}
  no.scripts['dev'] = 'vite'
  no.scripts['build'] = 'vite build'
  no.scripts['preview'] = 'vite preview'

  return {
    ...(await plainTemplates(no)),
    'vite.config.ts': dedent`
      import { defineConfig } from 'vite'
      import dts from 'vite-plugin-dts'
      
      export default defineConfig({
        plugins: [dts()],
        build: {
          outDir: 'dist',
          lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
            fileName: 'index'
          },
          rollupOptions: {
            output: {
              exports: 'named'
            }
          }
        }
      })
    `,
  }
}
