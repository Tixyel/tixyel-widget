const vscode = require('vscode')
const fs = require('fs')

module.exports = {
  name: 'completeTemplateWidget',
  run: (data) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let dirs = [
        { name: 'development', files: ['index.html', 'script.jsx', 'style.css', 'cf.json'] },
        { name: 'finished', files: ['HTML.txt', 'SCRIPT.txt', 'CSS.txt', 'CF.txt'] },
        { name: 'widget.io' },
      ],
      sample = '00 - Widget Sample'

    let createFile = function (/** @type {fs.PathOrFileDescriptor} */ path, /** @type {string | NodeJS.ArrayBufferView} */ content) {
      fs.writeFile(path, content, 'utf8', (err) => {
        if (err) console.log(err)
      })
    }

    let createDir = function (/** @type {fs.PathLike} */ path, /** @type {Array} */ files, /** @type {function} */ callback) {
      if (!fs.existsSync(path)) fs.mkdirSync(path)

      files.length &&
        files.forEach((file) => {
          let pathFile = path + '\\' + file
          createFile(pathFile, '')
        })

      if (callback) return callback()
    }

    let parentDir = data['fsPath'] + '\\' + sample

    createDir(parentDir, [], () => {
      dirs.forEach(({ name, files }) => {
        let pathFolder = parentDir + '\\' + name

        createDir(pathFolder, files)
      })
    })

    vscode.window.showInformationMessage('Template completo criado com sucesso')
  },
}
