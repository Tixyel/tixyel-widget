const vscode = require('vscode')

// Commands

const commands = [
  require('./commands/template/templateWidget'),
  require('./commands/template/completeTemplateWidget'),
  require('./commands/generate/generateWidgetIo'),
  require('./commands/generate/generateFinishedFiles'),
  require('./commands/generate/finishThisWidget'),
  require('./commands/simulation/generateSimulationRaw'),
]

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const [templateWidget, cTemplateWidget, generateWidgetIo, finishedFiles, finishThisWidget, generateSimulationRaw] = commands

  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + templateWidget.name, templateWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + cTemplateWidget.name, cTemplateWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + generateWidgetIo.name, generateWidgetIo.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + finishedFiles.name, finishedFiles.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + finishThisWidget.name, finishThisWidget.run))
  context.subscriptions.push(vscode.commands.registerCommand('tixyel-widget.' + generateSimulationRaw.name, generateSimulationRaw.run))
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
