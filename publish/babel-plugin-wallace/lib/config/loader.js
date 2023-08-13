const fs = require('fs');
const path = require('path');
const {directives} = require('./directives');


const config = {
  options: {
    inlineDelimiters: ['{', '}']
  },
  aliases: {
    '': 'watch'
  },
  directives: directives
}

// Use custom config file if there is one.
const customConfigFile = path.join(process.cwd(), 'wallace.config.js')

if (fs.existsSync(customConfigFile)) {

  var customConfig = require(customConfigFile)
  if (customConfig.directives) {
    Object.assign(config.directives, customConfig.directives)
  }
  // TODO: check options are valid.
  if (customConfig.options) {
    Object.assign(config.options, customConfig.options)
  }
}

for (const key of Object.keys(config.directives)) {
  if (key.toLowerCase().startsWith("on") && key !== "on") {
    throw new Error(`Directive "${key}" may not start with 'on' as this is reserved for event handlers.`)
  }
}

// const directives = config.directives
// for (const [key, value] of Object.entries(config.aliases)) {
//   directives[':' + key] = directives[':' + value]
// }

module.exports = {config}