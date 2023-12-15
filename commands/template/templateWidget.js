const vscode = require('vscode')

const { createDir, createFile } = require('../../functions/manageFs')

module.exports = {
  name: 'templateWidget',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    const { folders: dirs } = vscode.workspace.getConfiguration().get('tixyel-widget')['fullWidgetTemplate']

    let execute = (path = '', { fileName = '', content = '' }) => createFile(path + '\\' + fileName, content)

    for await (const { name, files } of dirs) {
      await createDir(fsPath + '\\' + name, { files, execute })
    }

    vscode.window.showInformationMessage('Template criado com sucesso')
  },
}
