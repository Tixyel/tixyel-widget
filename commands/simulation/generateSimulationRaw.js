const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const { createFile } = require('../../functions/manageFs')
const { getGist, getGists, runUpdate, runCreate } = require('../../functions/gistManage')

module.exports = {
  name: 'generateSimulationRaw',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let { token } = vscode.workspace.getConfiguration().get('tixyel-widget')['generateSimulation'],
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

    const regex = {
      version: /\b(\d+\.\d+\.\d+)\b/g,
      raw_pattern: /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
      raw_replace: '$1://gistcdn.githack.com/$2',
    }

    let simulation = fs.readFileSync(path.dirname(fsPath) + '\\' + 'simulation.js', 'utf8')

    if (!simulation) return vscode.window.showInformationMessage('Você precisa estar próximo a um arquivo de simulação')

    let version = simulation.match(regex.version)[0],
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
        const { raw_url } = Object.values(res.files)[0]

        if (regex.raw_pattern.test(raw_url))
          updateFields(raw_url.replace(regex.raw_pattern, regex.raw_replace)).then(() =>
            vscode.window.showInformationMessage('Custom fields atualizado com sucesso!'),
          )
        else return vscode.window.showInformationMessage('Ocorreu algum erro...')
      },
      updateSimulation = async (/** @type {Object} */ item) => {
        return await getGist(item.id, headers, async (/** @type {Object} */ res) => {
          let { content } = Object.values(res.files)[0]

          version = content.match(regex.version)[0]

          content.length && (await createFile(path.dirname(fsPath) + '\\' + 'simulation.js', content))

          return callback(res)
        })
      }

    getGists(headers, async (/** @type {Array} */ res) => {
      if (Array.isArray(res)) {
        res = res.filter(({ description }) => description.includes('Simulation')).slice(0, 5)

        if (res.some(({ description }) => description.match(regex.version)[0] > version))
          updateSimulation(res.find(({ description }) => description.match(regex.version)[0] > version))
        else if (res.some(({ description }) => description.includes(version)))
          runUpdate(res.find(({ description }) => description.includes(version)).id, headers, body, callback)
        else runCreate(headers, body, callback)
      } else console.error(res)
    })
  },
}
