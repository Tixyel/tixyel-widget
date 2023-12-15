const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const { createFile } = require('../../functions/manageFs')
const { getGists, runUpdate, runCreate } = require('../../functions/gistManage')

module.exports = {
  name: 'generateSimulationRaw',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let { token } = vscode.workspace.getConfiguration().get('tixyel-widget')['generateSimulation'],
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

    let simulation = fs.readFileSync(path.dirname(fsPath) + '\\' + 'simulation.js', 'utf8')

    if (!simulation) return vscode.window.showInformationMessage('Você precisa estar próximo a um arquivo de simulação')

    let version = simulation.match(/\b(\d+\.\d+\.\d+)\b/g)[0],
      body = JSON.stringify({
        'description': 'Simulation ' + version,
        'public': false,
        'files': {
          'simulation.js': {
            'content': simulation,
          },
        },
      })

    const updateFields = async (/** @type {String} */ git_raw) => {
      return createFile(
        fsPath + '\\' + 'development' + '\\' + 'cf.json',
        fs
          .readFileSync(fsPath + '\\' + 'development' + '\\' + 'cf.json', 'utf8')
          .replace(
            /"version":\s*{[^}]+}/,
            `"version": {\n    "type": "hidden",\n    "label": "Simulation ${version}",\n    "group": "Debug Settings"\n  }`,
          )
          .replace(
            /"simulation":\s*{[^}]+}/,
            `"simulation": {\n    "type6": "text",\n    "label": "Simulation script",\n    "value": "${git_raw}",\n    "group": "Debug Settings"\n  }`,
          ),
      )
    }

    const callback = function (/** @type {Object} */ res) {
      const { files } = res,
        file = Object.values(files)[0],
        { raw_url } = file

      let [pattern, replace] = [
          /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
          '$1://gistcdn.githack.com/$2',
        ],
        githack

      if (pattern.test(raw_url)) {
        githack = raw_url.replace(pattern, replace)

        updateFields(githack).then(() => vscode.window.showInformationMessage('Custom fields atualizado com sucesso!'))
      } else return vscode.window.showInformationMessage('Ocorreu algum erro...')
    }

    getGists(headers, async (/** @type {Array} */ res) => {
      if (Array.isArray(res)) {
        if (res.some(({ description }) => description.includes(version))) {
          let { id } = res.find(({ description }) => description.includes(version))

          runUpdate(id, headers, body, callback)
        } else runCreate(headers, body, callback)
      } else console.error(res)
    })
  },
}
