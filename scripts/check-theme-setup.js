#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const globals = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8')
const themeContext = fs.readFileSync(path.resolve(__dirname, '../src/app/contexts/ThemeContext.tsx'), 'utf8')

let ok = true

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg)
    ok = false
  } else {
    console.log('OK:', msg)
  }
}

assert(globals.includes(':root'), 'globals.css has :root declarations')
assert(globals.includes('html.dark'), 'globals.css has html.dark overrides')
assert(globals.includes('--accent-primary'), 'globals.css defines --accent-primary var')

assert(themeContext.includes("localStorage.getItem('theme')"), 'ThemeContext reads localStorage')
assert(themeContext.includes("document.documentElement.classList"), 'ThemeContext manipulates document.documentElement classList')

if (!ok) process.exit(1)
console.log('\nTheme setup basic checks passed — globals.css + ThemeContext look correctly configured.')
