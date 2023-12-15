const vscode = require('vscode')

const { createDir, createFile } = require('../../functions/manageFs')

module.exports = {
  name: 'completeTemplateWidget',
  run: (data = {}) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    const { folders: dirs, name: sample } = vscode.workspace.getConfiguration().get('tixyel-widget')['fullWidgetTemplate']

    let parentDir = data['fsPath'] + '\\' + sample

    let execute = (path = '', { fileName = '', content = '' }) => createFile(path + '\\' + fileName, content),
      callback = () => dirs.forEach(({ name, files }) => createDir(parentDir + '\\' + name, { files, execute }))

    createDir(parentDir, { callback }).then(() => vscode.window.showInformationMessage('Template completo criado com sucesso'))
  },
}
