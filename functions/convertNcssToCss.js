function convertNcssToCss(ncss) {
  const tokens = [],
    quotes = [],
    quoteToken = ':Q=' + (Math.random() + '=Q:').substring(2)

  ncss
    .replace(/<!\[CDATA\[([\s\S]*)]]>/g, '$1') // remove CDATA
    .replace(/(['"])(.*?[^\\])?\1|\([^)]+:\/\/[^)]+\)/g, (q) => quoteToken + quotes.push(q)) // store and remove quotes
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '') // remove remarks
    .replace(/([\s\S]*?)\s*([;{}]|$)/g, (_, g1, g2) =>
      tokens.push.apply(
        tokens,
        [g1, g2].map((s) => s.trim()).filter((s) => s),
      ),
    ) // tokenize

  return flattenRules()
    .replace(/[ \n]*\n */g, '\n')
    .replace(new RegExp(quoteToken + '(\\d+)', 'g'), (_, n) => quotes[n - 1]) // restore quotes

  function flattenRules() {
    function addRules(rules, selectors, styles) {
      rules.push([selectors, styles])

      const get = () => tokens.shift()

      let atRule = null,
        ll

      for (let token = get(); token; token = get()) {
        if (/^@/.test(token)) {
          atRule = ''
          ll = 0
        }

        if (atRule != null) {
          if (token != ';') atRule += ' '

          atRule += token

          if (token == '{') ++ll

          if ((token == '}' && --ll == 0) || (token == ';' && ll == 0)) {
            const parts = /^([^{]+){([\s\S]*)}$/.exec(atRule)

            if (parts && /^\s*@(media|supports|document)/.test(parts[0])) atRule = parts[1] + '{' + convertNcssToCss(parts[2]).replace(/\n/g, ' ') + ' }'

            rules.push([[], [atRule.replace(/ *\n */g, ' ')]])

            atRule = null
          }
        } else if (token == '}') break
        else if (tokens[0] == '{') {
          // next token is {
          get() // skip {

          let deeperSelectors = []

          token
            .split(/\s*,\s*/)
            .forEach((tsel) =>
              selectors.forEach((sel) =>
                deeperSelectors.push(
                  tsel.includes('&') ? tsel.replace(/^(.*?)\s*&/, (_, prefix) => (prefix ? prefix + ' ' + sel.trim() : sel)) : sel + ' ' + tsel,
                ),
              ),
            )

          addRules(rules, deeperSelectors, [])
        } else styles.push(token)
      }

      return rules
    }

    return addRules([], [''], [])
      .filter(([_, styles]) => styles[0])
      .map(([selectors, styles]) => selectors + (selectors[0] ? ` { ${styles.join(' ')} }` : styles.join('\n')).replace(/ ;/g, ';'))
      .join('\n')
  }
}

module.exports = convertNcssToCss
