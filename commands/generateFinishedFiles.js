const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const CleanCSS = require('clean-css')
const { obfuscate } = require('javascript-obfuscator')

module.exports = {
  name: 'generateFinishedFiles',
  run: async (data) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let { fsPath } = data

    let files = await getAllFilesFromFolder(fsPath)

    let createFile = function (/** @type {fs.PathOrFileDescriptor} */ path, /** @type {string | NodeJS.ArrayBufferView} */ content) {
      fs.writeFile(path, content, 'utf8', (err) => err && (console.error(err), vscode.window.showInformationMessage('Ocorreu algum erro...')))
    }

    let content = await obfuscateFiles(files)

    content.forEach(([key, content]) => {
      createFile(fsPath.replace('development', 'finished\\') + key, content)
    })

    vscode.window.showInformationMessage('Arquivos de finalização gerados!')
  },
}

async function obfuscateFiles(files) {
  let result = {
    'CF.txt': { format: '.json' },
    'HTML.txt': { format: '.html' },
    'CSS.txt': { format: '.css' },
    'SCRIPT.txt': { format: ['.jsx', '.js'] },
  }

  for await (let { fileName, filePath } of files) {
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
        newContent = new CleanCSS({}).minify(content).styles
        result[key].formated = `\n<style>${newContent}</style>`
        break

      case 'isJs':
        newContent = obfuscate(content, {
          'compact': true,
          'controlFlowFlattening': true,
          'deadCodeInjection': false,
          'debugProtection': false,
          'disableConsoleOutput': true,
          'identifierNamesGenerator': 'hexadecimal',
          'log': false,
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
        let bodyRegex = content.match(/<body>([\s\S]*?)<\/body>/i)[0]

        newContent = bodyRegex.match(/<script[^>]*src=".*?">.*?<\/script>|<main>.*?<\/main>/gs).join('\n')

        result[key].formated = newContent
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

/**
 * @param {fs.PathLike} dir
 */
async function getAllFilesFromFolder(dir) {
  return fs.readdirSync(dir).flatMap((fileName) => {
    return { fileName, filePath: dir + '\\' + fileName }
  })
}
