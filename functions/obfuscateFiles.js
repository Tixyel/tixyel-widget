const fs = require('fs')
const path = require('path')
const CleanCSS = require('clean-css')
const { obfuscate } = require('javascript-obfuscator')

module.exports = async function obfuscateFiles(/** @type {Array} */ allFiles, /** @type {Object} */ finishedFiles) {
  let result = finishedFiles

  for await (let { fileName, path: filePath } of allFiles) {
    result = {
      ...result,
      ...Object.entries(result)
        .filter(([, { format }]) => (Array.isArray(format) ? format.some((f) => f == path.extname(fileName)) : format == path.extname(fileName)))
        .reduce((acc, [key]) => {
          acc[key] = {
            ...acc[key],
            format: path.extname(fileName).replace('.jsx', '.js'),
            content: fs.readFileSync(filePath, 'utf8'),
          }

          return acc
        }, {}),
    }
  }

  Object.entries(result).forEach(([key, { format, content }]) => {
    let type = (format == '.css' && 'isCss') || (format == '.js' && 'isJs') || (format == '.html' && 'isHtml'),
      newContent = content

    switch (type) {
      case 'isCss':
        // @ts-ignore
        result[key].formated = `\n<style>${new CleanCSS({}).minify(content).styles}</style>`
        break

      case 'isJs':
        newContent = obfuscate(content, {
          'compact': true,
          'controlFlowFlattening': true,
          'deadCodeInjection': false,
          'debugProtection': false,
          'disableConsoleOutput': false,
          'identifierNamesGenerator': 'hexadecimal',
          'log': true,
          'renameGlobals': false,
          'rotateStringArray': true,
          'selfDefending': true,
          'shuffleStringArray': true,
          'splitStrings': false,
          'stringArray': true,
          'stringArrayEncoding': ['none', 'base64', 'rc4'],
          'stringArrayThreshold': 0.75,
          'unicodeEscapeSequence': false,
        })
        result[key].formated = `<script>${newContent}</script>`
        break

      case 'isHtml':
        result[key].formated = content
          .match(/<body>([\s\S]*?)<\/body>/i)[0]
          .match(/<script[^>]*src=".*?">.*?<\/script>|<main>.*?<\/main>/gs)
          .join('\n')
        break

      default:
        result[key].formated = content
        break
    }
  })

  return Object.entries(
    Object.entries(result).reduce((acc, [key, { formated }]) => {
      if (['HTML', 'CF'].some((word) => key.includes(word))) acc[key] = formated
      else {
        acc['HTML.txt'] += '\n' + formated
        acc[key] = ''
      }

      return acc
    }, {}),
  )
}
