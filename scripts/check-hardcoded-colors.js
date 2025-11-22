#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..', 'src')

const hexRe = /#[0-9a-fA-F]{3,6}/g
const rgbRe = /rgba?\(/gi

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(full)
    } else if (e.isFile()) {
      if (full.endsWith('globals.css')) continue
      if (!full.endsWith('.css') && !full.endsWith('.tsx') && !full.endsWith('.ts') && !full.endsWith('.jsx') && !full.endsWith('.js') && !full.endsWith('.svg')) continue
      const content = fs.readFileSync(full, 'utf8')
      const hex = content.match(hexRe)
      const rgb = content.match(rgbRe)
      if ((hex && hex.length) || (rgb && rgb.length)) {
        console.log(`Found in ${path.relative(process.cwd(), full)} -> hex:${hex ? hex.join(',') : '0'} rgb:${rgb ? rgb.length : 0}`)
      }
    }
  }
}

try {
  walk(root)
  console.log('\nSearch complete — open the above files and replace hardcoded colors with theme variables in src/app/globals.css.')
} catch (err) {
  console.error(err)
  process.exit(1)
}
