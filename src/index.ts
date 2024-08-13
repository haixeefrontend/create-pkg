import { createRequire } from 'node:module'

import { confirm, input } from '@inquirer/prompts'
import * as fse from 'fs-extra'
import { plainTemplates } from './templates'

const require = createRequire(import.meta.url)

const cac = require('cac')() as import('cac').CAC

cac
  .command('[path]', 'Create a new NPM package')
  .option('-n, --name <name>', 'Package name')
  .option('-y, --yes', 'Skip prompts')
  .action(async (path, options) => {
    if (!path) {
      path = await input({ message: 'Enter the path to create the package' })
    }
    if (!options.name) {
      options.name = await input({ message: 'Enter the package name' })
    }

    if (!options.yes) {
      const confirmCreate = await confirm({
        message: `The package will be created at ${path}. Continue?`,
      })
      if (!confirmCreate) {
        console.log('Package creation canceled')
        return
      }
    }

    console.log('Creating package...')

    await fse.mkdirp(path)
    const templates = await plainTemplates({ name: options.name })
    for (const [name, content] of Object.entries(templates)) {
      await fse.outputFile(`${path}/${name}`, content + '\n')
    }

    console.log('Package created successfully!')
  })

cac.parse()
