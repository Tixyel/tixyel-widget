//

module.exports = {
  files: {
    'html.txt': { fileName: 'HTML.txt' },
    'css.txt': { fileName: 'CSS.txt' },
    'js.txt': { fileName: 'SCRIPT.txt' },
    'fields.txt': { fileName: 'CF.txt' },
    'data.txt': { content: '{}' },

    'widget.ini': {
      content:
        '[HTML]\npath = "html.txt"\n\n[CSS]\npath = "css.txt"\n\n[JS]\npath = "js.txt"\n\n[FIELDS]\npath = "fields.txt"\n\n[DATA]\npath = "data.txt"',
    },
  },
}
