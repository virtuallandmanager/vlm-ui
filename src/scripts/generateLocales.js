#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const localesDir = path.join(__dirname, '../locales')
const outputFile = path.join(__dirname, '../locales/locales.json')

fs.readdir(localesDir, (err, files) => {
  if (err) {
    console.error('Unable to scan directory:', err)
    return
  }

  const locales = files
    .filter((file) => path.extname(file) === '.json')
    .map((file) => {
      const filePath = path.join(localesDir, file)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      return {
        code: content.code,
        name: content.name,
        flag: content.flag,
      }
    })

  fs.writeFile(outputFile, JSON.stringify(locales, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err)
      return
    }
    console.log('Locales list written to', outputFile)
  })
})
