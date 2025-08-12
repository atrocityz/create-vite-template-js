#!/usr/bin/env node

import prompts from 'prompts'
import path from 'path'
import { existsSync, readdirSync, rmSync } from 'fs'
import degit from 'degit'
import {blue, green, bold, red} from 'kolorist'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
const forceAdvancedGit = argv.git === true
const forceVanilla = argv.vanilla === true

const run = async () => {
  let useAdvancedGit

  if (forceAdvancedGit || forceVanilla) {
    useAdvancedGit = forceAdvancedGit
    console.log(green(`\nSkipping prompt — using ${forceAdvancedGit ? bold('"Advanced work with Git"') : bold('"Vanilla"')} template (--${forceAdvancedGit ? 'git' : 'vanilla'})`))
  } else {
    console.log(`\n${blue(bold('? '))} Would you like to use ${blue('Advanced work with Git')}:`)
    const response = await prompts({
      type: 'select',
      name: 'useAdvancedGit',
      message: '',
      choices: [
        {title: 'Yes', value: true},
        {title: 'No', value: false},
      ],
      initial: 1
    })
    useAdvancedGit = response.useAdvancedGit
  }

  console.log(`${blue(bold('? '))} Name your project (or "." to use current directory):`)
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: '',
    placeholder: 'my-app',
    validate: name => name.trim().length ? true : 'Please enter a project name.'
  })

  const targetDir = name.trim() === '.' ? process.cwd() : path.resolve(process.cwd(), name)
  const visibleName = name.trim() === '.' ? path.basename(targetDir) : name

  console.log(green(`Project will be created in: ${targetDir} \n`))

  console.log(`Checking target directory...`)
  const repo = useAdvancedGit
    ? 'atrocityz/vite-template-js-git'
    : 'atrocityz/vite-template-js-vanilla'

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: `Directory "${name}" is not empty. How would you like to proceed?`,
      choices: [
        { title: 'Keep files and continue', value: 'keep' },
        { title: 'Remove all files and continue', value: 'clear' },
        { title: 'Cancel installation', value: 'cancel' }
      ]
    })

    if (action === 'cancel') {
      process.exit(0)
    }

    if (action === 'clear') {
      const files = readdirSync(targetDir)
      for (const file of files) {
        if (file === '.git') continue
        rmSync(path.join(targetDir, file), { recursive: true, force: true })
      }
    }
  } else {
    console.log(green('Target directory is empty. Proceeding...'))
  }

  console.log(`Downloading template into "${visibleName}"...`)
  const emitter = degit(repo, {
    cache: false,
    force: true,
    verbose: false
  })

  try {
    await emitter.clone(targetDir)
    console.log(green(`\nTemplate cloned successfully to: ${targetDir} \n`))
  } catch (err) {
    console.error(red(`Failed to clone template: ${err.message}`))
    process.exit(1)
  }

  console.log(blue(`Run the following commands:`))

  if (name.trim() !== '.') {
    console.log(`  cd ${name}`)
  }

  console.log('  npm install\n')
}

run()