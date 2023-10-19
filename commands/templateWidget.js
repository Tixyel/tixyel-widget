const vscode = require('vscode')
const fs = require('fs')

module.exports = {
  name: 'templateWidget',
  run: (data) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let dirs = [
      { name: 'development', files: ['index.html', 'script.jsx', 'style.css', 'cf.json'] },
      { name: 'finished', files: ['HTML.txt', 'SCRIPT.txt', 'CSS.txt', 'CF.txt'] },
      { name: 'widget.io', files: [] },
    ]

    let createFile = function (/** @type {fs.PathOrFileDescriptor} */ path, /** @type {string | NodeJS.ArrayBufferView} */ content) {
      fs.writeFile(path, content, 'utf8', (err) => {
        if (err) console.error(err)
      })
    }

    let createDir = function (/** @type {fs.PathLike} */ path, /** @type {Array} */ files, /** @type {Function} */ callback) {
      if (!fs.existsSync(path)) fs.mkdirSync(path)

      files.length &&
        files.forEach((file) => {
          let pathFile = path + '\\' + file
          createFile(pathFile, '')
        })

      if (callback) return callback
      else return true
    }

    dirs.forEach(({ name, files }) => {
      let pathFolder = data['fsPath'] + '\\' + name

      createDir(pathFolder, files)
    })

    vscode.window.showInformationMessage('Template criado com sucesso')
  },
}
