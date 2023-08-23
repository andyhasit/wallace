/**
 * The object which holds the directive definitions.
 * 
 * A directive definition's handler's "this" is a NodeData instance.
 */
const {RequestsHelp, alwaysUpdate, neverUpdate} = require('../definitions/constants')
const componentRefVariable = 'c'; // The variable name by which the component will be known.


const old = {
  // What is this for?
  "bind": {
    params: 'watch, event?',
    handle: function(watch, event='change') {
      this.addWatch(watch, undefined, 'value')
      this.addEventListener(event, `${watch} = w.getValue()`)
    }
  },
  "checked": {
    params: 'watch, converter?',
    handle: function(watch, converter) {
      this.addWatch(watch, converter, 'checked')
    }
  },
  "css": {
    params: 'watch, converter?',
    handle: function(watch, converter) {
      this.addWatch(watch, converter, 'css')
    }
  },
  "css-f": {
    params: 'value',
    handle: function(value) {
      this.addWatch(neverUpdate, value, 'css')
    }
  },
  // "el": {
  //   handle: function(arg) {
  //     this.saveAs = arg
  //   }
  // },
  // "hide": {
  //   params: 'watch',
  //   handle: function(watch) {
  //     this.shieldQuery = watch
  //   }
  // },
  "helper": {
    handle: function(watch, converter) {
      throw new RequestsHelp(helpTopic)
    }
  },
  "inner": {
    params: 'watch, converter',
    handle: function(watch, converter) {
      this.addWatch(watch, converter, 'inner')
    }
  },
  "items": {
    params: 'watch, converter?',
    handle: function(watch, converter) {
      this.addWatch(watch, converter, 'items', componentRefVariable)
    }
  },
  // "on": {
  //   params: 'event, callbackStr',
  //   handle: function(event, callbackStr) {
  //     this.addEventListener(event, callbackStr)
  //   }
  // },
  // "pool": {
  //   params: 'poolInstance',
  //   handle: function(poolInstance) {
  //     this.chainedCalls.push(`pool(${poolInstance})`)
  //   }
  // },
  // "props": {
  //   params: 'args',
  //   handle: function(args) {
  //     this.props = this.expandProps(args)
  //   }
  // },
  "replace": {
    params: 'componentCls, props?',
    handle: function(componentCls, props) {
      this.replaceWith = componentCls
      if (props) {
        this.props = this.expandProps(props)
      }
    }
  },
  // "show": {
  //   params: 'watch',
  //   handle: function(watch) {
  //     this.shieldQuery = watch
  //     this.reverseShield = 1
  //   }
  // },
  "stub": {
    params: 'stubName',
    handle: function(stubName) {
      this.stubName = stubName
    }
  },
  "swap": {
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
  // Only for repeat items
  "use": {
    params: 'componentDef, key?',
    handle: function(componentDef, key) {
      this.chainedCalls.push(`pool(${this.buildPoolInit(componentDef, key)})`)
    }
  },
  "value": {
    params: 'watch, converter?',
    handle: function(watch, converter) {
      this.addWatch(watch, converter, 'value')
    }
  },
  "watch": {
    params: 'watch, converter, wrapperMethod?',
    handle: function(watch, converter, wrapperMethod) {
      this.addWatch(watch, converter, wrapperMethod)
    }
  },
  // "wrapper": {
  //   params: 'cls, args?',
  //   handle: function(cls, args) {
  //     this.customWrapperClass = cls
  //     this.customWrapperArgs = args
  //   }
  // }
}


const callData = {
  value: "str", // if type str
  args: "str", // if type expr
  qualifier: "str|undefined", // foo:qualifier
}


const schema = {
  help: "...",
  allowNull: false,
  allowQualifier: false,
  requireQualifier: false,
  requireNull: false,
  handle: "function(nodeData, callData)",
  args: "array", // only if type "expr"
  argSets: "array", // in case it allows multiple args
}

/**
 * Do not create directive which allows or requires null which has the same name as a
 * normal attribute.
 */
const directives = {
  att: {
    help: `
      Sets an HTML attribute on the element:

      /h <div _att:hidden="x > 3"></div>
    `,
    requireQualifier: true,
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], undefined, `@${attInfo.qualifier}`)
    }

  },
  call: {
    help: `
      Watch a value and call a wrapper method if it changes.

      /h <div _call:method={watch, tranform}></div>
      
      Variables for watch: c, p
      Variables for callback: c, p, n, o, w
    `,
    requireQualifier: true,
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], attInfo.args[1], attInfo.qualifier)
    }
  },
  checked: {
    help: `
      Sets the "checked" status of the element:

      /h <input _checked={c.active} type="checkbox"/>
    `,
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], undefined, 'checked')
    }
  },
  // disabled: {
  //   help: `
  //     Sets the "disabled" status of the element:

  //     /h <button _disabled={!c.active}>...</button>
  //   `,
  //   allowedTypes: "expr",
  //   handle: function(nodeData, attInfo) {
  //     nodeData.addWatch(attInfo.args[0], undefined, 'disabled')
  //   }
  // },
  el: {
    help: `
      Gives the wrapper for this element a name so it can be accessed later:

      /h <div _el:user></div>
      
      /j c.el.user.text("Wallace")
    `,
    allowNull: true,
    requireQualifier: true,
    handle: function(nodeData, attInfo) {
      nodeData.saveAs = attInfo.qualifier
    }
  },
  foreach: {
    help: `
      Repeats a nested component:

      /h  <div>
      /h    <Child _for={c.items|id} />
      /h  </div>

    `,
    handle: function(nodeData, attInfo) {
      const parent = nodeData.parentNodeData
      if (parent === undefined) {
        // TODO: throw better error, and assert parent has no other chldren.
        throw Error("For must be used under a parent.")
      }
      const componentDef = nodeData.nestedClass
      const data = attInfo.args[0]
      const key = attInfo.args[1]
      parent.chainedCalls.push(`pool(${parent.buildPoolInit(componentDef, key)})`)
      parent.addWatch(alwaysUpdate, data, 'items', componentRefVariable)
      nodeData.isRepeat = true
    }
  },
  hidden: {
    help: `
      Hides an element:

      /h <div hidden={x > 10}></div>
      
      Available args are: c, p
    `,
    handle: function(nodeData, attInfo) {
      nodeData.shieldQuery = attInfo.args[0]
    }
  },
  on: {
    help: `
      Creates an event handler:

      /h <div on:click={alert('hello')}></div>
      
      Available args are: w, e
    `,
    requireQualifier: true,
    handle: function(nodeData, attInfo) {
      nodeData.addEventListener(attInfo.qualifier, attInfo.args[0])
    }
  },

  // TODO: change this because we may use a special wrapper?
  pool: {
    help: `
      Specify a pool object for repeat items:

      /h <div pool={poolObject}></div>
      
    `,
    handle: function(nodeData, attInfo) {
      nodeData.chainedCalls.push(`pool(${attInfo.args[0]})`)
    }
  },
  props: {
    help: `
      Specify props for a nested component:

      /h <NestedComponent props={{foo: 'bar'}} />
      
    `,
    handle: function(nodeData, attInfo) {
      nodeData.props = nodeData.expandProps(attInfo.args[0])
    }
  },
  show: {
    help: `
      Shows an element:

      /h <div show={x > 10}></div>
      
      Variables are: c, p
    `,
    handle: function(nodeData, attInfo) {
      nodeData.shieldQuery = attInfo.args[0]
      nodeData.reverseShield = 1
    }
  },
  style: {
    help: `
      Sets the style directive:

      /h <div style:color={p.color}></div>
      
      Variables are: c, p
    `,
    requireQualifier: true,
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], undefined, 'style', `'${attInfo.qualifier}'`)
    }
  },
  watch: {
    help: `
      Watch a value and call

      /h <div watch={watch, callback}></div>
      
      Variables for watch: c, p
      Variables for callback: c, p, n, o, w
    `,
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(...attInfo.args)
    }
  },
  wrapper: {
    help: `
      Specify an alternative wrapper class:

      /h <div wrapper={MyCustomWrapper}></div>
      
      Available args are: c, p
    `,
    handle: function(nodeData, attInfo) {
      nodeData.customWrapperClass = attInfo.args[0]
    }
  },
}

// Do not import directly, only through index so we get custom directives too.
module.exports = {directives}

