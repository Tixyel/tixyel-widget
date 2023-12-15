const vscode = require('vscode')

const fetch = require('node-fetch')
const path = require('path')
const fs = require('fs')
const { createFile } = require('../../functions/manageFs')

const { runUpdate, runCreate } = require('../../functions/gistManage')

module.exports = {
  name: 'generateSimulationRaw',
  run: async ({ fsPath }) => {
    if (!vscode.workspace.workspaceFolders) return vscode.window.showInformationMessage('Você precisa abrir uma workspace ou uma pasta')

    let token = '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',
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

    let simulation = fs.readFileSync(path.dirname(fsPath) + '\\' + 'simulation.js', 'utf8'),
      version = simulation.match(/\b(\d+\.\d+\.\d+)\b/g)[0],
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
      let cf = fs.readFileSync(fsPath + '\\' + 'development' + '\\' + 'cf.json', 'utf8')

      return createFile(
        fsPath + '\\' + 'development' + '\\' + 'cf.json',
        cf
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

    const callback = function (res) {
      const { files } = res,
        file = Object.values(files)[0],
        // eslint-disable-next-line no-unused-vars
        { content, filename, language, raw_url, type } = file

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

    // const runUpdate = async (/** @type {String} */ id) => {
    //     // @ts-ignore
    //     return await fetch('https://api.github.com/gists/' + id, {
    //       method: 'PATCH',
    //       headers,
    //       body,
    //     })
    //       .then((res) => res.json())
    //       .then((res) => {
    //         callback(res)
    //       })
    //   },
    //   runCreate = async () => {
    //     // @ts-ignore
    //     return await fetch('https://api.github.com/gists', {
    //       method: 'POST',
    //       headers,
    //       body,
    //     })
    //       .then((res) => res.json())
    //       .then((res) => {
    //         callback(res)
    //       })
    //   }

    // @ts-ignore
    await fetch('https://api.github.com/gists', {
      method: 'GET',
      headers,
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.some(({ description }) => description.includes(version))) {
          let { id } = res.find(({ description }) => description.includes(version))

          runUpdate(id)
        } else {
          console.log('create')
          runCreate()
        }
      })
  },
}
