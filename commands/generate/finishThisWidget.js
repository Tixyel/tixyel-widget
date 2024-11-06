const vscode = require('vscode');

const { writeZip, getAllFilesFromFolder, createFile } = require('../../functions/manageFs');
const obfuscateFiles = require('../../functions/obfuscateFiles');

module.exports = {
  name: 'finishThisWidget',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta');

    const { files: finishedFiles } = vscode.workspace.getConfiguration().get('tixyel-widget')['finishedFiles'];
    const { files } = vscode.workspace.getConfiguration().get('tixyel-widget')['widgetZip'];

    getAllFilesFromFolder(fsPath + '\\' + 'development').then((allFiles) =>
      obfuscateFiles(allFiles, finishedFiles).then(async (contents) => {
        for await (let [key, content] of contents) {
          await createFile(fsPath + '\\' + 'finished' + '\\' + key, content);
        }

        vscode.window.showInformationMessage('Arquivos de finalização gerados!');

        getAllFilesFromFolder(fsPath + '\\' + 'finished').then(async () => {
          let createFiles = Object.entries(files).reduce((acc, [key, { fileName, content }]) => {
            acc[key] = { content: content || contents.find(([key]) => key == fileName)[1] };

            return acc;
          }, {});

          writeZip(fsPath + '\\' + 'widget.io' + '\\', { createFiles }).then(() => {
            vscode.window.showInformationMessage('Arquivo .zip criado com sucesso!');
          });
        });
      }),
    );
  },
};
