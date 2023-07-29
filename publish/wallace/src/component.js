import {KeyedPool, InstancePool, SequentialPool} from './pool'
import {buildComponent, createComponent} from  './utils'
import {und, makeEl} from './helpers'
import mountie from './mountie'
import {Wrapper} from './wrapper'
import {Lookup} from './lookup'

const noop = function() {}

/**
 * Represents a component.
 */
export function Component(parent) {
  const s = this
  s.parent = parent       // The parent component
  s.props = undefined     // The props passed to the component. May be changed.

  // These will be set during build
  s.e = null              // the element
  s.el = null             // the named wrappers

  // Internal state objects
  s.__nv = []             // Nested components
  s.__ov = {}             // The old values for watches to compare against
} 


var proto = Component.prototype

proto.onUpdate = noop
proto.afterUpdate = noop
proto.onInit = noop
proto.afterInit = noop

/**
 * Gets called once immediately after building.
 * Sets initial props extracted from __html__.
 * Note there is an issue here, in that we rely on there being initial props to call init
 * on nested components.
 */
proto.init = function() {
  this.onInit()
  for (let key in this.__ip) {
    let nestedComponent = this.el[key]
    let callback = this.__ip[key]
    if (callback) {
      nestedComponent.props = callback(this, this.props)
    }
    nestedComponent.init()
  }
  this.afterInit()
}
/**
 * Calls a function somewhere up the parent tree.
 */
proto.bubble = function(name) {
  let target = this.parent
  while (!und(target)) {
    if (target[name]) {     
      // We don't really care about performance here, so accessing arguments is fine.   
      return target[name].apply(target,  Array.prototype.slice.call(arguments, 1))
    }
    target = target.parent
  }
  throw 'Bubble popped.'
}
/**
 * Move the component to new parent. Necessary if sharing a pool.
 */
proto.move = function(newParent) {
  if (this.parent && this.parent.__nv) {
    const nv = this.parent.__nv
    nv.splice(nv.indexOf(this), 1)
  }
  this.parent = newParent
}
/**
 * Builds a nested component of the specified class. Its up to you how you use it.
 */
proto.nest = function(cls, props) {
  const child = createComponent(cls, this, props || this.props)
  this.__nv.push(child)
  return child
}
/**
 * Lookup a watched value during update. Returns an object with {o, n, c}
 * (oldValue, newValue, changed).
 * You must call this.resetLookups before calling this during an update.
 * The point is to pool the result so it doesn't have to be repeated.
 */
proto.lookup = function(query) {
  return this.__qc.get(this, query)
}
/**
 * Resets the lookups, must be called before calling this.lookup() during an update.
 */
proto.resetLookups = function() {
  this.__qc.reset()
}
/**
 * Sets the props and updates the component.
 */
proto.setProps = function(props) {
  this.props = props
  this.update()
  return this
}
/**
 * Call this if you want to get mount() and unmount() callbacks.
 */
proto.trackMounting = function() {
  this.__mt.track(this)
}
/**
 * Updates the component.
 */
proto.update = function() {
  this.onUpdate()
  this.resetLookups()
  this.updateSelf()
  this.updateNested()
  this.afterUpdate()
}
/**
 * Loops over watches skipping shielded watches if elements are hidden.
 */
proto.updateSelf = function() {
  let i = 0, watch, wrapper, shieldCount, shieldQuery, shieldQueryResult, shouldBeVisible
  const watches = this.__wc
  const il = watches.length
  while (i < il) {
    watch = watches[i]
    wrapper = this.el[watch.wk]
    shieldQuery = watch.sq
    i ++
    shouldBeVisible = true
    if (shieldQuery) {
      // Get the newValue for shieldQuery using lookup
      shieldQueryResult = this.lookup(shieldQuery).n

      // Determine if shouldBeVisible based on reverseShield
      // i.e. whether "shieldQuery===true" means show or hide.
      shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult

      // The number of watches to skip if this element is not visible
      shieldCount = shouldBeVisible ? 0 : watch.sc

      // Set the element visibility
      wrapper.visible(shouldBeVisible)
      i += shieldCount
    }
    if (shouldBeVisible) {
      applyWatchCallbacks(this, wrapper, watch.cb)
    }
  }
}
/**
 * Update nested components (but not repeat elements).
 */
proto.updateNested = function() {
  // These are user created by calling nest()
  const items = this.__nv
  for (let i=0, il=items.length; i<il; i++) {
    let child = items[i]
    if (child.__ia()) {
      child.update()
    }
  }
  // These are created with directives, and whose props arguments may need reprocessed.
  for (let key in this.__ip) {
    let callback = this.__ip[key]
    let nestedComponent = this.el[key]
    if (callback) {
      nestedComponent.setProps(callback(this, this.props))
    } else {
      nestedComponent.update()
    }
  }
}
/**
 * Calls the callback if the value has changed (
 */
// changed(name, callback) {
//   const n = this.__ov[name]
//   const o = this.props[name]
//   if (n !== o) {
//     callback(n, o)
//   }
// }


/**
 * Creates a watch.
 */
proto.__wa = function(wrapperKey, shieldQuery, reverseShield, shieldCount, callbacks) {
  return {
    wk: wrapperKey,       // The key of the corresponding wrapper.
    sq: shieldQuery,      // The shield query key
    rv: reverseShield,    // whether shieldQuery should be flipped
    sc: shieldCount,      // The number of items to shield
    cb: callbacks         // The callbacks - object
  }
}


const applyWatchCallbacks = (component, wrapper, callbacks) => {
  
  for (let key in callbacks) {
    let callback = callbacks[key]
    if (key === '*') {
      callback.call(component, wrapper, component.props, component)
    } else {
      // means: {new, old, changed}
      const {n, o, c} = component.lookup(key)
      if (c) {
        callback.call(component, n, o, wrapper, component.props, component)
      }
    }
  }
}


/**
 * The global mount tracker.
 */
proto.__mt = mountie

/**
 * Nest Internal. For building a nested component declared in the html.
 */
proto.__ni = function(path, cls) {
  const child = buildComponent(cls, this)
  this.__gw(path).replace(child.e)
  return child
}

/**
 * 
 * @param {function} baseClass - the base class to extend from
 * @param {object} [prototypeExtras] - an object with extra things to be added to the prototype
 * @param {function} [prototypeExtras] - the function to be used as constructor
 */
Component.prototype.__ex = function(baseClass, prototypeExtras, constructorFunction) {
  var subClass = constructorFunction || function(parent) {
    baseClass.call(this, parent)
  }
  subClass.prototype = Object.create(baseClass && baseClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  }); 
  if (prototypeExtras) {
    Object.assign(subClass.prototype, prototypeExtras);
  }
  return subClass
}


/**
 * Create a component pool.
 */
proto.pool = function(cls, keyFn) {
  return keyFn ? new KeyedPool(cls, keyFn) : new SequentialPool(cls)
}

/**
 * Create an instance pool, for switches.
 */
proto.__ic = function(mappings, fallback) {
  return new InstancePool(mappings, fallback)
}

/**
 * Build the DOM. We pass prototype as local var for compactness.
 */
proto.__bd = function(prototype) {
  if (prototype.__cn === undefined) {
    prototype.__cn = makeEl(prototype.__ht)
  }
  this.e = prototype.__cn.cloneNode(true)
}

// proto.__bd = function(prototype, clone) {
//   if (clone && !prototype.__cn) {
//     prototype.__cn = makeEl(prototype.__ht)
//   }
//   this.e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht)
// }

// proto.__bd = function(prototype) {
//   this.e = makeEl(prototype.__ht)
// }

/**
 * Returns a regular wrapper around element at path, where path is an array of indices.
 * This is used by the babel plugin.
 */
proto.__gw =  function(path) {
  return new Wrapper(this.__fe(path))
}

/**
 * Finds an element at specified path, where path is an array of indices.
 * This is used by the babel plugin.
 */
proto.__fe = function(path) {
  return path.reduce((acc, index) => acc.childNodes[index], this.e)
}

/**
 * Is Attached.
 * Determines whether this component is attached to the DOM.
 */
proto.__ia = function() {
  let e = this.e
  while (e) {
    if (e === document) {
      return true
    }
    e = e.parentNode
  }
  return false
}

/**
 * Creates a lookup.
 */
proto.__lu = function(callbacks) {
  return new Lookup(callbacks)
}

/**
 * Creates an anonymous stub component class
 */
proto.__sv = function() {
  const cls = function(parent) {
    Component.call(this, parent)
  }
  cls.prototype = new Component()
  return cls
}

/**
 * Toggles visibility, like wrapper.
 */
proto.visible = function(visible) {
  this.e.classList.toggle('hidden', !visible)
}
