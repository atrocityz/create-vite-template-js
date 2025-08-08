#!/usr/bin/env node

import prompts from 'prompts'
import path from 'path'
import { existsSync, readdirSync, rmSync } from 'fs'
import degit from 'degit'
import { blue, cyan, green, bold } from 'kolorist'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
const forceAdvancedGit = argv.git === true
const forceVanilla = argv.vanilla === true

const showLogo = () => {
  console.log()
  console.log(cyan('╭───────────────────────────────────────╮'))
  console.log(cyan('│') + bold(blue('     Vite Template JS Starter CLI     ')) + cyan('│'))
  console.log(cyan('╰───────────────────────────────────────╯'))
  console.log()
}

const run = async () => {
  console.log(cyan('┃'))

  let useAdvancedGit

  if (forceAdvancedGit || forceVanilla) {
    useAdvancedGit = forceAdvancedGit
    console.log(cyan(`┃ ${bold('◉ Step 1 →')} Skipping prompt — using ${forceAdvancedGit ? 'Advanced work with Git' : 'Vanilla'} template (--${forceAdvancedGit ? 'git' : 'vanilla'})`))
  } else {
    console.log(cyan(`┃ ${bold('◉ Step 1 →')} Choose a template:`))
    const response = await prompts({
      type: 'select',
      name: 'useAdvancedGit',
      message: '',
      choices: [
        { title: 'Vanilla', value: false },
        { title: 'AdvancedGit', value: true },
      ],
      initial: 0
    })
    useAdvancedGit = response.useAdvancedGit
    console.log(cyan(`┃ ${green(`You selected the ${useAdvancedGit ? 'Advanced work with Git' : 'Vanilla'} template`)}`))
  }
  console.log(cyan('┃'))

  console.log(cyan(`┃ ${bold('◉ Step 2 →')} Name your project (or "." to use current directory):`))
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: '',
    placeholder: 'my-app',
    validate: name => name.trim().length ? true : 'Please enter a project name.'
  })

  const targetDir = name.trim() === '.' ? process.cwd() : path.resolve(process.cwd(), name)
  const visibleName = name.trim() === '.' ? path.basename(targetDir) : name

  console.log(cyan(`┃ ${green(`Project will be created in: ${targetDir}`)}`))
  console.log(cyan('┃'))

  console.log(cyan(`┃ ${bold('◉ Step 3 →')} Checking target directory...`))
  const repo = useAdvancedGit
    ? 'atrocityz/vite-template-js-git'
    : 'atrocityz/vite-template-js-vanilla'

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: `Directory "${name}" is not empty. How would you like to proceed?`,
      choices: [
        { title: '❌ Cancel installation', value: 'cancel' },
        { title: '🧹 Remove all files and continue', value: 'clear' },
        { title: '✅ Keep files and continue', value: 'keep' }
      ]
    })

    if (action === 'cancel') {
      console.log('🚫 Operation cancelled.')
      process.exit(0)
    }

    if (action === 'clear') {
      const files = readdirSync(targetDir)
      for (const file of files) {
        if (file === '.git') continue
        rmSync(path.join(targetDir, file), { recursive: true, force: true })
      }
      console.log('🧹 Cleared directory.')
    }
  } else {
    console.log(cyan(`┃ ${green('Target directory is empty. Proceeding...\n')}`))
  }

  console.log(cyan(`┃ ${bold('◉ Step 4 →')} Downloading template into "${visibleName}"...`))
  const emitter = degit(repo, {
    cache: false,
    force: true,
    verbose: false
  })

  try {
    await emitter.clone(targetDir)
    console.log(cyan(`┃ ${green(`Template cloned successfully to: ${targetDir}`)}`))
  } catch (err) {
    console.error(`❌ Failed to clone template: ${err.message}`)
    process.exit(1)
  }

  console.log(cyan('┃'))
  console.log(cyan(`┃ ${bold('◉ Final step →')} Run the following commands:`))

  if (name.trim() !== '.') {
    console.log(`\n  cd ${name}`)
  }

  console.log('  npm install')
  console.log('  npm run start\n')
}

showLogo()
run()