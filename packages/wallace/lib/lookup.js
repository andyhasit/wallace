const ALWAYS_UPDATE = "*";
/**
 * Used internally.
 * An object which pools the results of lookup queries so we don't have to
 * repeat them in the same component.
 * The Lookup instance will be shared between instances of a component.
 * Must call reset() on every update.
 */
export function Lookup(callbacks) {
  this.callbacks = callbacks;
  this.run = {};
}

Lookup.prototype = {
  /**
   * Lookup a watched value during update. Returns an object with {o, n, c}
   * (oldValue, newValue, changed).
   * You must resetLookups before calling get during an update.
   * The point is to pool the result so it doesn't have to be repeated.
   */
  get: function (component, props, key) {
    const run = this.run;
    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      // Or is this harmful to performance because we're just reading values more than calling functions?
      let o = component.__ov[key];
      // TODO: is this checking for watchOnce?
      o = o === undefined ? "" : o;
      const n = this.callbacks[key](props, component);
      const c = n !== o;
      component.__ov[key] = n;
      const rtn = { n, o, c };
      run[key] = rtn;
      return rtn;
    }
    return run[key];
  },
  reset: function () {
    this.run = {};
  },
  applyCallbacks: function (component, props, element, callbacks) {
    for (let key in callbacks) {
      let callback = callbacks[key];
      if (key === ALWAYS_UPDATE) {
        callback.call(component, element, component.props, component);
      } else {
        const result = this.get(component, props, key);
        if (result.c) {
          callback.call(
            component,
            result.n,
            result.o,
            element,
            props,
            component,
          );
        }
      }
    }
  },
};
