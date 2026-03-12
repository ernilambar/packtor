#!/usr/bin/env node

import { packtor } from './src/app.js'

packtor().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
