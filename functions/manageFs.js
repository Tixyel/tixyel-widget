const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')

module.exports = {
  createFile: async function (/** @type {fs.PathOrFileDescriptor} */ path, /** @type {string | NodeJS.ArrayBufferView} */ content) {
    return fs.writeFile(path, content, 'utf8', (err) => err && console.log(err))
  },

  createDir: async function (/** @type {fs.PathLike} */ path, /** @type {Object} */ { files = [], execute, callback }) {
    !fs.existsSync(path) && fs.mkdirSync(path)

    files.length &&
      execute &&
      (await files.forEach(async function (content = {}) {
        await execute(path, content)
      }))

    if (callback) return callback()
    else return true
  },

  getAllFilesFromFolder: async function (/** @type {fs.PathLike} */ dir) {
    return fs.readdirSync(dir).flatMap((fileName) => {
      return { fileName, path: dir + '\\' + fileName }
    })
  },

  writeZip: async function (/** @type {any} */ fsPath, /** @type {Object} */ { createFiles }) {
    let zip = new JSZip()

    createFiles && Object.entries(createFiles).forEach(([key, { content }]) => zip.file(key, content))

    zip
      .generateInternalStream({ type: 'base64' })
      .accumulate()
      .then(function (data) {
        return fs.writeFile(
          fsPath + path.basename(path.dirname(fsPath)) + '.zip',
          data,
          'base64',
          (err) => err && (console.error('err', err), vscode.window.showInformationMessage('Ocorreu algum erro...')),
        )
      })
  },
}
