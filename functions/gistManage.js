const fetch = require('node-fetch')

module.exports = {
  runUpdate: async (/** @type {String} */ id, headers, body, callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists/' + id, {
      method: 'PATCH',
      headers,
      body,
    })
      .then((res) => res.json())
      .then((res) => {
        callback(res)
      })
  },
  runCreate: async (headers, body, callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body,
    })
      .then((res) => res.json())
      .then((res) => {
        callback(res)
      })
  },
}
