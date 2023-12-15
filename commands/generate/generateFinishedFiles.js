const vscode = require('vscode')

const { createFile, getAllFilesFromFolder } = require('../../functions/manageFs')
const obfuscateFiles = require('../../functions/obfuscateFiles')

module.exports = {
  name: 'generateFinishedFiles',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    const { files: finishedFiles } = vscode.workspace.getConfiguration().get('tixyel-widget')['finishedFiles']

    getAllFilesFromFolder(fsPath).then((allFiles) =>
      obfuscateFiles(allFiles, finishedFiles).then(async (contents) => {
        for await (const [key, content] of contents) {
          await createFile(fsPath.replace('development', 'finished\\') + key, content)
        }

        vscode.window.showInformationMessage('Arquivos de finalização gerados!')
      }),
    )
  },
}
