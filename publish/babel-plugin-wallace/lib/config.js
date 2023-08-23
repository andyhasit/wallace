const {alwaysUpdate, componentRefVariable} = require('./definitions/constants')

/**
 * Constructor for the single config instance.
 */
function Config(directives) {
  this.directives = {}
  for (const [key, value] of Object.entries(directives)) {
    this.directives[key] = applyDirectiveDefaults(value)
  }
}

/**
 * This allows the user to configure the single config instance.
 */
Config.prototype.configure = function(customConfig) {
  if (customConfig.directives) {
    // TODO: validate case, format etc...
    Object.assign(this.directives, customConfig.directives)
  }
}

// Move to types
const callData = {
  value: "str", // if type str
  args: "str", // if type expr
  qualifier: "str|undefined", // foo:qualifier
}


const schema = {
  help: "str",
  allow: "str|expr|null",
  qualifier: "yes|no|optional",
  handle: "function(nodeData, callData)",
  args: "array", // only if type "expr"
  argSets: "array", // in case it allows multiple args
}

const applyDirectiveDefaults = (directive) => {
  const defaults = {
    allow: "expr",
    qualifier: "no",
    handle: "function(nodeData, callData)"
  }
  Object.assign(defaults, directive)
  return defaults
}


const directives = {
  att: {
    help: `
    Sets an HTML attribute on the element:
    
    /h <div _att:hidden="x > 3"></div>
    `,
    allow: "expr",
    qualifier: "yes",
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], attInfo.args[1], `@${attInfo.qualifier}`)
    }

  },
  call: {
    help: `
    Watch a value and call a wrapper method if it changes.
    
    /h <div _call:method={watch, tranform}></div>
    
    Variables for watch: c, p
    Variables for callback: c, p, n, o, w
    `,
    allow: "expr",
    qualifier: "yes",
    handle: function(nodeData, attInfo) {
      nodeData.addWatch(attInfo.args[0], attInfo.args[1], attInfo.qualifier)
    }
  },
  // checked: {
  //   help: `
  //   Sets the "checked" status of the element:
    
  //   /h <input _checked={c.active} type="checkbox"/>
  //   `,
  //   allow: "expr",
  //   handle: function(nodeData, attInfo) {
  //     nodeData.addWatch(attInfo.args[0], undefined, 'checked')
  //   }
  // },
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
  // class: {
  //   help: `
  //   Sets the "checked" status of the element:
    
  //   /h <input _checked={c.active} type="checkbox"/>
  //   `,
  //   allow: "expr",
  //   handle: function(nodeData, attInfo) {
  //     nodeData.addWatch(attInfo.args[0], undefined, 'className')
  //   }
  // },
  el: {
    help: `
    Gives the wrapper for this element a name so it can be accessed later:
    
    /h <div el:user></div>
    
    /j c.el.user.text("Wallace")
    `,
    allow: "null",
    qualifier: "yes",
    handle: function(nodeData, attInfo) {
      nodeData.saveAs = attInfo.qualifier
    }
  },
  repeat: {
    help: `
    Repeats a nested component:
    
    /h  <div>
    /h    <Child repeat={c.items|id} />
    /h  </div>
    
    `,
    allow: "expr",
    handle: function(nodeData, attInfo) {
      const parent = nodeData.parentNodeData
      if (parent === undefined) {
        // TODO: throw better error, and assert parent has no other children.
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
    allow: "expr",
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
    allow: "expr",
    qualifier: "yes",
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
    allow: "expr",
    handle: function(nodeData, attInfo) {
      nodeData.chainedCalls.push(`pool(${attInfo.args[0]})`)
    }
  },
  props: {
    help: `
    Specify props for a nested component:
    
    /h <NestedComponent props={{foo: 'bar'}} />
    
    `,
    allow: "expr",
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
    allow: "expr",
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
    allow: "expr",
    qualifier: "yes",
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
    allow: "expr",
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
    allow: "expr",
    handle: function(nodeData, attInfo) {
      nodeData.customWrapperClass = attInfo.args[0]
    }
  },
}

const config = new Config(directives)

module.exports = {config}