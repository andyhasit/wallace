/**
 * The object which holds the directive definitions.
 * 
 * A directive definition's handler's "this" is a NodeData instance.
 */
const fs = require('fs');
const path = require('path');
const componentRefVariable = 'c'; // The variable name by which the component will be known.
const watchAlways = '*';
const watchNever = '';



const config = {
  options: {
    inlineDelimiters: ['{', '}']
  },
  aliases: {
    '': 'watch'
  },
  directives: {
    ':bind': {
      params: 'watch, event?',
      handle: function(watch, event='change') {
        this.addWatch(watch, undefined, 'value')
        this.addEventListener(event, `${watch} = w.getValue()`)
      }
    },
    ':checked': {
      params: 'watch, converter?',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'checked')
      }
    },
    ':css': {
      params: 'watch, converter?',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'css')
      }
    },
    ':css-f': {
      params: 'value',
      handle: function(value) {
        this.addWatch(watchNever, value, 'css')
      }
    },
    ':el': {
      handle: function(arg) {
        this.saveAs = arg
      }
    },
    ':hide': {
      params: 'watch',
      handle: function(watch) {
        this.shieldQuery = watch
      }
    },
    ':inner': {
      params: 'watch, converter',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'inner')
      }
    },
    ':items': {
      params: 'watch, converter?',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'items', componentRefVariable)
      }
    },
    ':on': {
      params: 'event, callbackStr',
      handle: function(event, callbackStr) {
        this.addEventListener(event, callbackStr)
      }
    },
    ':pool': {
      params: 'poolInstance',
      handle: function(poolInstance) {
        this.chainedCalls.push(`pool(${poolInstance})`)
      }
    },
    ':props': {
      params: 'args',
      handle: function(args) {
        this.props = this.expandProps(args)
      }
    },
    ':replace': {
      params: 'componentCls, props?',
      handle: function(componentCls, props) {
        this.replaceWith = componentCls
        if (props) {
          this.props = this.expandProps(props)
        }
      }
    },
    ':show': {
      params: 'watch',
      handle: function(watch) {
        this.shieldQuery = watch
        this.reverseShield = 1
      }
    },
    ':stub': {
      params: 'stubName',
      handle: function(stubName) {
        this.stubName = stubName
      }
    },
    ':style': {
      params: 'stubName',
      handle: function(stubName) {
        this.stubName = stubName
      }
    },
    ':swap': {
      params: 'watch, mappings, fallback?',
      handle: function(watch, mappings, fallback) {
        let args = this.expandDots(mappings)
        if (fallback) {
          args += ', ' + this.expandDots(fallback)
        }
        this.chainedCalls.push(`pool(component.__ic(${args}))`)
        this.addWatch(watch, undefined, 'swap', componentRefVariable)
      }
    },
    ':use': {
      params: 'componentDef, key?',
      handle: function(componentDef, key) {
        this.chainedCalls.push(`pool(${this.buildPoolInit(componentDef, key)})`)
      }
    },
    ':value': {
      params: 'watch, converter?',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'value')
      }
    },
    ':watch': {
      params: 'watch, converter, wrapperMethod?',
      handle: function(watch, converter, wrapperMethod) {
        this.addWatch(watch, converter, wrapperMethod)
      }
    },
    ':wrapper': {
      params: 'cls, args?',
      handle: function(cls, args) {
        this.customWrapperClass = cls
        this.customWrapperArgs = args
      }
    }
  }
}




// Use customm config file if there is one.
const customConfigFile = path.join(process.cwd(), 'wallace.config.js')

if (fs.existsSync(customConfigFile)) {
  var customConfig = require(customConfigFile)
  Object.assign(config.directives, customConfig.directives)
  Object.assign(config.options, customConfig.options)
}

const directives = config.directives

for (const [key, value] of Object.entries(config.aliases)) {
  directives[':' + key] = directives[':' + value]
}


module.exports = {config}
