const fetch = require('node-fetch')

module.exports = {
  getGist: async (/** @type {String} */ id, /** @type {Object} */ headers, /** @type {Function} */ callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists/' + id, {
      method: 'GET',
      headers,
    })
      .then((/** @type {fetch.Response} */ res) => res.json())
      .then((/** @type {Object} */ res) => {
        callback(res)
      })
  },
  getGists: async (/** @type {Object} */ headers, /** @type {Function} */ callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists', {
      method: 'GET',
      headers,
    })
      .then((/** @type {fetch.Response} */ res) => res.json())
      .then((/** @type {Object} */ res) => {
        callback(res)
      })
  },
  runUpdate: async (/** @type {String} */ id, /** @type {Object} */ headers, /** @type {Object} */ body, /** @type {Function} */ callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists/' + id, {
      method: 'PATCH',
      headers,
      body,
    })
      .then((/** @type {fetch.Response} */ res) => res.json())
      .then((/** @type {Object} */ res) => {
        callback(res)
      })
  },
  runCreate: async (/** @type {Object} */ headers, /** @type {Object} */ body, /** @type {Function} */ callback) => {
    // @ts-ignore
    return await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body,
    })
      .then((/** @type {fetch.Response} */ res) => res.json())
      .then((/** @type {Object} */ res) => {
        callback(res)
      })
  },
}
