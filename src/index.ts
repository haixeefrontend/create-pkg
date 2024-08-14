import { createRequire } from 'node:module'

import { confirm, input, select } from '@inquirer/prompts'
import * as fse from 'fs-extra'

import pkg from '../package.json' with { type: 'json' }
import { plainTemplates, TemplateOption, viteTemplates } from './templates.js'

const require = createRequire(import.meta.url)

const cac = require('cac')(pkg.name) as import('cac').CAC

cac
  .command('[path]', 'Create a new NPM package')
  .option('-n, --name <name>', 'Package name')
  .option('-t, --template <template>', 'Template to use')
  .option('-y, --yes', 'Skip prompts')
  .action(async (path, options) => {
    if (!path) {
      path = await input({ message: 'Enter the path to create the package' })
    }
    if (!options.name) {
      options.name = await input({ message: 'Enter the package name' })
    }

    let template: (o: TemplateOption) => Promise<Record<string, string>> = viteTemplates
    if (!options.template) {
      options.template = await select({
        message: 'Select a template',
        choices: [
          { name: 'Vite', value: 'vite' },
          { name: 'Plain', value: 'plain' },
        ],
      })
    }
    switch (options.template) {
      case 'plain':
        template = plainTemplates
        break
      case 'vite':
        template = viteTemplates
        break
      default:
        break
    }

    if (!options.yes) {
      const confirmCreate = await confirm({
        message: `The package will be created at ${path} with template ${options.template || 'vite'}. Continue?`,
      })
      if (!confirmCreate) {
        console.log('Package creation canceled')
        return
      }
    }

    console.log('Creating package...')

    await fse.mkdirp(path)
    const templates = await template({ name: options.name })
    for (const [name, content] of Object.entries(templates)) {
      await fse.outputFile(`${path}/${name}`, content + '\n')
    }

    console.log('Package created successfully!')
  })

cac.help()
cac.version(pkg.version)
cac.parse()
