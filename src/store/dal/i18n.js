import fs from 'fs'
import path from 'path'

const localesDir = path.join(__dirname, 'src', 'locales')

export const generateLocalesList = () => {
  fs.readdir(localesDir, (err, files) => {
    if (err) {
      console.error('Unable to scan directory:', err)
      return
    }

    const locales = files.filter((file) => path.extname(file) === '.json').map((file) => path.basename(file, '.json'))

    return locales
  })
}

export const fetchJsonData = async (filePath) => {
  try {
    const jsonContent = await import(`${filePath}`)
    return jsonContent
  } catch (error) {
    console.error('Error fetching JSON file:', error)
  }
}
