import {und} from './helpers'

/**
 * Used internally.
 * An object which pools the results of lookup queries so we don't have to
 * repeat them in the same component.
 * The Lookup instance will be shared between instances of a component.
 * Must call reset() on every update.
 */
export function Lookup(callbacks) {
  this.callbacks = callbacks
  this.run = {}
}

Lookup.prototype = {
  get: function(component, key) {
    const run = this.run
    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      // Or is this harmful to performance because we're just reading values more than calling functions?
      let o = component.__ov[key]
      o = und(o) ? '' : o 
      const n = this.callbacks[key](component, component.props)
      const c = n !== o
      component.__ov[key] = n
      const rtn = {n, o, c}
      run[key] = rtn
      return rtn
    }
    return run[key]
  },
  reset: function() {
    this.run = {}
  }
}

