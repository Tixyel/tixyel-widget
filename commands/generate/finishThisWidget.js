const vscode = require('vscode')
const fs = require('fs')

const { files: finishedFiles } = require('../../data/finishedFiles')
const { files } = require('../../data/widgetZip')
const { writeZip, getAllFilesFromFolder, createFile } = require('../../functions/manageFs')
const obfuscateFiles = require('../../functions/obfuscateFiles')

module.exports = {
  name: 'finishThisWidget',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    getAllFilesFromFolder(fsPath + '\\' + 'development').then((allFiles) =>
      obfuscateFiles(allFiles, finishedFiles).then(async (contents) => {
        for await (const [key, content] of contents) {
          await createFile(fsPath + '\\' + 'finished\\' + key, content)
        }

        vscode.window.showInformationMessage('Arquivos de finalização gerados!')

        getAllFilesFromFolder(fsPath + '\\' + 'finished').then(async (allFiles) => {
          let createFiles = Object.entries(files).reduce((acc, [key, { fileName, content }]) => {
            acc[key] = { content: content || fs.readFileSync(fileName ? allFiles.find(({ fileName: name }) => name == fileName).path : '', 'utf8') }

            return acc
          }, {})

          writeZip(fsPath + '\\widget.io\\', { createFiles }).then(() => {
            vscode.window.showInformationMessage('Arquivo .zip criado com sucesso!')
          })
        })
      }),
    )
  },
}
