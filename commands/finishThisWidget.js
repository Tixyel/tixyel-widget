const vscode = require('vscode')
const JSZip = require('jszip')
const fs = require('fs')
const path = require('path')

// O que fazer?

/**
 * Pegar pasta FINISHED e:
 *
 * Obfuscator em script.jsx ou script.js
 * Minify em style.css
 * Separar MAIN do html e adicionar <script src="{simulation}"></script> no topo
 * E outros scripts dentro de body
 *
 * Criar .zip com ['html.txt', 'css.txt', 'js.txt', 'fields.txt', 'data.txt']
 *
 */

module.exports = {
  name: 'finishThisWidget',
  run: async (data) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let { fsPath } = data

    await writeZip(fsPath.replace('finished', 'widget.io\\'), await getAllFilesFromFolder(fsPath))

    vscode.window.showInformationMessage('Arquivo .zip criado com sucesso!')
  },
}

/**
 * @param {fs.PathLike} dir
 */
async function getAllFilesFromFolder(dir) {
  return fs.readdirSync(dir).flatMap((fileName) => {
    return { fileName, path: dir + '\\' + fileName }
  })
}

async function writeZip(fsPath, files) {
  let zip = new JSZip()

  let createFiles = {
    'html.txt': { content: fs.readFileSync(files.filter(({ fileName }) => fileName == 'HTML.txt')[0].path || '', 'utf8') },
    'css.txt': { content: fs.readFileSync(files.filter(({ fileName }) => fileName == 'CSS.txt')[0].path || '', 'utf8') },
    'js.txt': { content: fs.readFileSync(files.filter(({ fileName }) => fileName == 'SCRIPT.txt')[0].path || '', 'utf8') },
    'fields.txt': { content: fs.readFileSync(files.filter(({ fileName }) => fileName == 'CF.txt')[0].path || '{}', 'utf8') },
    'data.txt': { content: '{}' },
  }

  zip.file(
    'widget.ini',
    `[HTML]\npath = "html.txt"\n\n[CSS]\npath = "css.txt"\n\n[JS]\npath = "js.txt"\n\n[FIELDS]\npath = "fields.txt"\n\n[DATA]\npath = "data.txt"`,
  )

  Object.entries(createFiles).forEach(([key, { content }]) => zip.file(key, content))

  return zip
    .generateInternalStream({ type: 'base64' })
    .accumulate()
    .then(function (data) {
      fs.writeFile(
        fsPath + path.basename(path.dirname(fsPath)) + '.zip',
        data,
        'base64',
        (err) => err && (console.error('err', err), vscode.window.showInformationMessage('Ocorreu algum erro...')),
      )
    })
}
