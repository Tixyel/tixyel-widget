const vscode = require('vscode')

// Commands

const commands = [
  require('./commands/templateWidget'),
  require('./commands/completeTemplateWidget'),
  require('./commands/finishThisWidget'),
  require('./commands/generateFinishedFiles'),
]

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const [templateWidget, cTemplateWidget, finishThisWidget, finishedFiles] = commands

  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + templateWidget.name.trim().replace(/\s/g, ''), templateWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + cTemplateWidget.name.trim().replace(/\s/g, ''), cTemplateWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + finishThisWidget.name.trim().replace(/\s/g, ''), finishThisWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + finishedFiles.name.trim().replace(/\s/g, ''), finishedFiles.run))
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
