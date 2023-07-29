const doc = document;
const throwAway = doc.createElement('template');

/**
 * Create an element from html string
 */
function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild
}

/**
 * Some utility functions
 */
const und = x => x === undefined;
const isStr = x => typeof x === 'string';

/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */
function Wrapper(element) {
  this.e = element;
  this._pool = undefined;
}

Wrapper.prototype = {
  /**
   * Get element as 'e' from item, else return text node.
   */
  __ge: function(item) {
    return item.e || doc.createTextNode(item)
  },
  /**
   * Gets an attribute from the element. Cannot be chained.
   */
  getAtt: function(name) {
    return this.e[name]
  },
  /**
   * Gets the element's value. Cannot be chained.
   */
  getValue: function() {
    return this.e.value
  },
  isChecked: function() {
    return this.e.checked
  },
  /* Every method below must return 'this' so it can be chained */
  append: function(item) {
    this.e.appendChild(this.__ge(item));
    return this
  },
  att: function(name, value) {
    this.e.setAttribute(name, value);
    return this
  },
  atts: function(atts) {
    for (let name in atts) {
      this.att(name, atts[name]);
    }
    return this
  },
  pool: function(pool) {
    this._pool = pool;
    return this
  },
  clear: function() {
    this.e.innerHTML = '';
    this.e.textContent = '';
    this.e.value = '';
    return this
  },
  checked: function(value) {
    this.e.checked = !!value;
    return this
  },
  child: function(wrapper) {
    this.e.innerHTML = '';
    this.e.appendChild(wrapper.e);
    return this
  },
  css: function(style) {
    this.e.className = style;
    return this
  },
  cssAdd: function(style) {
    this.e.classList.add(style);
    return this
  },
  cssRemove: function(style) {
    this.e.classList.remove(style);
    return this
  },
  cssToggle: function(style) {
    this.e.classList.toggle(style);
    return this
  },
  disabled: function(disabled) {
    this.e.disabled = disabled;
    return this
  },
  href: function(value) {
    return this.att('href', value)
  },
  html: function(html) {
    this.e.innerHTML = html;
    return this
  },
  id: function(value) {
    return this.att('id', value)
  },
  /*
   * Set inner as individual item or array. Not optimised.
   */
  inner: function(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    const e = this.e;
    e.innerHTML = '';
    for (var i=0, il=items.length; i<il; i++) {
      e.appendChild(this.__ge(items[i]));
    }
    return this
  },
  /*
   * Set items from pool.
   */
  items: function(items, parent) {
    this._pool.patch(this.e, items, parent);
    return this
  },
  on: function(event, callback) {
    this.e.addEventListener(event, e => callback(this, e));
    return this
  },
  replace: function(el) {
    this.e.parentNode.replaceChild(el, this.e);
    return this
  },
  src: function(value) {
    return this.att('src', value)
  },
  style: function(name, value) {
    this.e.style[name] = value;
    return this
  },
  swap: function(key, parent) {
    this.child(this._pool.getOne(key, parent));
    return this
  },
  text: function(value) {
    this.e.textContent = value;
    return this
  },
  visible: function(visible) {
    this.e.classList.toggle('hidden', !visible);
    return this
  },
  value: function(value) {
    this.e.value = value;
    return this
  }
};

/**
 * Creates and mounts a component onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 * @param {object} parent The parent component (optional)
 */
function mount(elementOrId, cls, props, parent) {
  const component = createComponent(cls, parent, props);
  const nodeToReplace = getElement(elementOrId);
  nodeToReplace.parentNode.replaceChild(component.e, nodeToReplace);
  return component
}

/**
 * returns a Wrapper around an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 */
function wrap(elementOrId) {
  return new Wrapper(getElement(elementOrId))
}


function getElement(elementOrId) {
  return isStr(elementOrId) ? document.getElementById(elementOrId) : elementOrId
}


/**
 * Creates a component and initialises it.
 *
 * @param {class} cls The class of Component to create
 * @param {object} parent The parent component (optional)
 * @param {object} props The props to pass to the component (optional)
 */
function createComponent(cls, parent, props) {
  const component = buildComponent(cls, parent);
  component.props = props;
  component.init();
  component.update();
  return component
}

/**
 * Builds a component.
 */
function buildComponent(cls, parent) {
  const component = new cls(parent);
  component.__bv(component, cls.prototype);
  return component
}


/**
 * Creates a wrapper of type tag e.g. h('div')
 */
function h(tag) {
  return new Wrapper(doc.createElement(tag))
}

/**
 * Pools same type components, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} componentClass - The class of Component to create.
 * @param {function} keyFn - A function which obtains the key to pool by
 */
function KeyedPool(componentClass, keyFn) {
  this._v = componentClass;
  this._f = keyFn;
  this._k = [];  // keys
  this._p = {};  // pool of component instances
}
const proto$1 = KeyedPool.prototype;

/**
 * Retrieves a single component. Though not used in Wallace itself, it may
 * be used elsewhere, such as in the router.
 * 
 * @param {Object} item - The item which will be passed as props.
 * @param {Component} parent - The parent component.
 */
proto$1.getOne = function(item, parent) {
  return this._get(this._p, this._v, this._f(item), item, parent)
};

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Component} parent - The parent component.
 */
proto$1.patch = function(e, items, parent) {
  const pool = this._p;
  const componentClass = this._v;
  const keyFn = this._f;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  const oldKeySequence = this._k;
  const newKeys = [];
  let item, key, component, childElementCount = oldKeySequence.length + 1;
  for (let i=0; i<itemsLength; i++) {
    item = items[i];
    key = keyFn(item);
    component = this._get(pool, componentClass, key, item, parent);
    newKeys.push(key);
    if (i > childElementCount) {
      e.appendChild(component.e);
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(component.e, childNodes[i]);
      pull(oldKeySequence, key, i);
    }
  }
  this._k = newKeys;
  trimChildren(e, childNodes, itemsLength);
};

// Internal
proto$1._get = function(pool, componentClass, key, item, parent) {
  let component;
  if (pool.hasOwnProperty(key)) {
    component = pool[key];
    component.setProps(item);
  } else {
    component = createComponent(componentClass, parent, item);
    pool[key] = component;
  }
  return component
};

/**
 * Pools same type components, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} componentClass - The class of Component to create.
 */
function SequentialPool(componentClass) {
  this._v = componentClass;
  this._p = [];  // pool of component instances
  this._c = 0;   // Child element count
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Component} parent - The parent component.
 */
SequentialPool.prototype.patch = function(e, items, parent) {
  const pool = this._p;
  const componentClass = this._v;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  let item, component, poolCount = pool.length, childElementCount = this._c;

  for (let i=0; i<itemsLength; i++) {
    item = items[i];
    if (i < poolCount) {
      component = pool[i];
      component.setProps(item);
    } else {
      component = createComponent(componentClass, parent, item);
      pool.push(component);
      poolCount ++;
    }
    if (i >= childElementCount) {
      e.appendChild(component.e);
    }
  }
  this._c = itemsLength;
  trimChildren(e, childNodes, itemsLength);
};

/**
 * An object which creates and pools components according to the mappings provided.
 * If there is no match in the mappings, the fallback function is called.
 * 
 * Note that the fallback must return an instance (of Component or Wrapper) whereas
 * mappings must specify component classes. 
 * 
 * You can rely solely on the fallback if you like.
 * 
 * @param {Object} mappings - a mapping of format key->componentClass
 * @param {function} fallback - a function to call when no key is provided.
 * 
 */
function InstancePool(mappings, fallback) {
  this._m = mappings;
  this._f = fallback;
  this._i = {}; // Instances
}

InstancePool.prototype.getOne = function(key, parentComponent) {
  if (!this._i.hasOwnProperty(key)) {
    this._i[key] = this._m.hasOwnProperty(key) ?
      parentComponent.nest(this._m[key]) : this._f(key, parentComponent);
  }
  return this._i[key]
};

/**
 * Trims the unwanted child elements from the end.
 * 
 * @param {Node} e 
 * @param {Array} childNodes 
 * @param {Int} itemsLength 
 */
function trimChildren(e, childNodes, itemsLength) {
  let lastIndex = childNodes.length - 1;
  let keepIndex = itemsLength - 1;
  for (let i=lastIndex; i>keepIndex; i--) {
    e.removeChild(childNodes[i]);
  }
}

/**
 * Pulls an item forward in an array, to replicate insertBefore.
 * @param {Array} arr 
 * @param {any} item 
 * @param {Int} to 
 */
function pull(arr, item, to) {
  const position = arr.indexOf(item);
  if (position != to) {
    arr.splice(to, 0, arr.splice(position, 1)[0]);
  }
}

/**
 * Wallace's crude way of tracking mounting and unmounting.
 */

const trackedComponents = [];

var mountie = {
  track: function (component) {
    trackedComponents.push({component: component, isAttached: component.__ia()});
  },
  flush: function () {
    for (let i=0, il=trackedComponents.length; i<il; i++) {
      let trackedComponent = trackedComponents[i];
      let component = trackedComponent.component;
      let attachedNow = component.__ia();
      if (attachedNow !== trackedComponent.isAttached) {
        let fn = attachedNow ? component.mount : component.unmount;
        fn.apply(component);
        trackedComponent.isAttached = attachedNow;
      }
    }
  }
};

/**
 * Used internally.
 * An object which pools the results of lookup queries so we don't have to
 * repeat them in the same component.
 * The Lookup instance will be shared between instances of a component.
 * Must call reset() on every update.
 */
function Lookup(callbacks) {
  this.callbacks = callbacks;
  this.run = {};
}

Lookup.prototype = {
  get: function(component, key) {
    const run = this.run;
    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      // Or is this harmful to performance because we're just reading values more than calling functions?
      let o = component.__ov[key];
      o = und(o) ? '' : o; 
      const n = this.callbacks[key](component, component.props);
      const c = n !== o;
      component.__ov[key] = n;
      const rtn = {n, o, c};
      run[key] = rtn;
      return rtn
    }
    return run[key]
  },
  reset: function() {
    this.run = {};
  }
};

const noop = function() {};

/**
 * Represents a component.
 */
function Component(parent) {
  const s = this;
  s.parent = parent;       // The parent component
  s.props = undefined;     // The props passed to the component. May be changed.

  // These will be set during build
  s.e = null;              // the element
  s.el = null;             // the named wrappers

  // Internal state objects
  s.__nv = [];             // Nested components
  s.__ov = {};             // The old values for watches to compare against
} 


var proto = Component.prototype;

proto.onUpdate = noop;
proto.afterUpdate = noop;
proto.onInit = noop;
proto.afterInit = noop;

/**
 * Gets called once immediately after building.
 * Sets initial props extracted from __html__.
 * Note there is an issue here, in that we rely on there being initial props to call init
 * on nested components.
 */
proto.init = function() {
  this.onInit();
  for (let key in this.__ip) {
    let nestedComponent = this.el[key];
    let callback = this.__ip[key];
    if (callback) {
      nestedComponent.props = callback(this, this.props);
    }
    nestedComponent.init();
  }
  this.afterInit();
};
/**
 * Calls a function somewhere up the parent tree.
 */
proto.bubble = function(name) {
  let target = this.parent;
  while (!und(target)) {
    if (target[name]) {     
      // We don't really care about performance here, so accessing arguments is fine.   
      return target[name].apply(target,  Array.prototype.slice.call(arguments, 1))
    }
    target = target.parent;
  }
  throw 'Bubble popped.'
};
/**
 * Move the component to new parent. Necessary if sharing a pool.
 */
proto.move = function(newParent) {
  if (this.parent && this.parent.__nv) {
    const nv = this.parent.__nv;
    nv.splice(nv.indexOf(this), 1);
  }
  this.parent = newParent;
};
/**
 * Builds a nested component of the specified class. Its up to you how you use it.
 */
proto.nest = function(cls, props) {
  const child = createComponent(cls, this, props || this.props);
  this.__nv.push(child);
  return child
};
/**
 * Lookup a watched value during update. Returns an object with {o, n, c}
 * (oldValue, newValue, changed).
 * You must call this.resetLookups before calling this during an update.
 * The point is to pool the result so it doesn't have to be repeated.
 */
proto.lookup = function(query) {
  return this.__qc.get(this, query)
};
/**
 * Resets the lookups, must be called before calling this.lookup() during an update.
 */
proto.resetLookups = function() {
  this.__qc.reset();
};
/**
 * Sets the props and updates the component.
 */
proto.setProps = function(props) {
  this.props = props;
  this.update();
  return this
};
/**
 * Call this if you want to get mount() and unmount() callbacks.
 */
proto.trackMounting = function() {
  this.__mt.track(this);
};
/**
 * Updates the component.
 */
proto.update = function() {
  this.onUpdate();
  this.resetLookups();
  this.updateSelf();
  this.updateNested();
  this.afterUpdate();
};
/**
 * Loops over watches skipping shielded watches if elements are hidden.
 */
proto.updateSelf = function() {
  let i = 0, watch, wrapper, shieldCount, shieldQuery, shieldQueryResult, shouldBeVisible;
  const watches = this.__wc;
  const il = watches.length;
  while (i < il) {
    watch = watches[i];
    wrapper = this.el[watch.wk];
    shieldQuery = watch.sq;
    i ++;
    shouldBeVisible = true;
    if (shieldQuery) {
      // Get the newValue for shieldQuery using lookup
      shieldQueryResult = this.lookup(shieldQuery).n;

      // Determine if shouldBeVisible based on reverseShield
      // i.e. whether "shieldQuery===true" means show or hide.
      shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult;

      // The number of watches to skip if this element is not visible
      shieldCount = shouldBeVisible ? 0 : watch.sc;

      // Set the element visibility
      wrapper.visible(shouldBeVisible);
      i += shieldCount;
    }
    if (shouldBeVisible) {
      applyWatchCallbacks(this, wrapper, watch.cb);
    }
  }
};
/**
 * Update nested components (but not repeat elements).
 */
proto.updateNested = function() {
  // These are user created by calling nest()
  const items = this.__nv;
  for (let i=0, il=items.length; i<il; i++) {
    let child = items[i];
    if (child.__ia()) {
      child.update();
    }
  }
  // These are created with directives, and whose props arguments may need reprocessed.
  for (let key in this.__ip) {
    let callback = this.__ip[key];
    let nestedComponent = this.el[key];
    if (callback) {
      nestedComponent.setProps(callback(this, this.props));
    } else {
      nestedComponent.update();
    }
  }
};
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
};


const applyWatchCallbacks = (component, wrapper, callbacks) => {
  
  for (let key in callbacks) {
    let callback = callbacks[key];
    if (key === '*') {
      callback.call(component, wrapper, component.props, component);
    } else {
      // means: {new, old, changed}
      const {n, o, c} = component.lookup(key);
      if (c) {
        callback.call(component, n, o, wrapper, component.props, component);
      }
    }
  }
};


/**
 * The global mount tracker.
 */
proto.__mt = mountie;

/**
 * Nest Internal. For building a nested component declared in the html.
 */
proto.__ni = function(path, cls) {
  const child = buildComponent(cls, this);
  this.__gw(path).replace(child.e);
  return child
};

/**
 * 
 * @param {function} baseClass - the base class to extend from
 * @param {object} [prototypeExtras] - an object with extra things to be added to the prototype
 * @param {function} [prototypeExtras] - the function to be used as constructor
 */
Component.prototype.__ex = function(baseClass, prototypeExtras, constructorFunction) {
  var subClass = constructorFunction || function(parent) {
    baseClass.call(this, parent);
  };
  subClass.prototype = Object.create(baseClass && baseClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  }); 
  if (prototypeExtras) {
    Object.assign(subClass.prototype, prototypeExtras);
  }
  return subClass
};


/**
 * Create a component pool.
 */
proto.pool = function(cls, keyFn) {
  return keyFn ? new KeyedPool(cls, keyFn) : new SequentialPool(cls)
};

/**
 * Create an instance pool, for switches.
 */
proto.__ic = function(mappings, fallback) {
  return new InstancePool(mappings, fallback)
};

/**
 * Build the DOM. We pass prototype as local var for compactness.
 */
proto.__bd = function(prototype) {
  if (prototype.__cn === undefined) {
    prototype.__cn = makeEl(prototype.__ht);
  }
  this.e = prototype.__cn.cloneNode(true);
};

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
};

/**
 * Finds an element at specified path, where path is an array of indices.
 * This is used by the babel plugin.
 */
proto.__fe = function(path) {
  return path.reduce((acc, index) => acc.childNodes[index], this.e)
};

/**
 * Is Attached.
 * Determines whether this component is attached to the DOM.
 */
proto.__ia = function() {
  let e = this.e;
  while (e) {
    if (e === document) {
      return true
    }
    e = e.parentNode;
  }
  return false
};

/**
 * Creates a lookup.
 */
proto.__lu = function(callbacks) {
  return new Lookup(callbacks)
};

/**
 * Creates an anonymous stub component class
 */
proto.__sv = function() {
  const cls = function(parent) {
    Component.call(this, parent);
  };
  cls.prototype = new Component();
  return cls
};

/**
 * Toggles visibility, like wrapper.
 */
proto.visible = function(visible) {
  this.e.classList.toggle('hidden', !visible);
};

module.exports = {
  createComponent,
  h,
  mount,
  KeyedPool,
  InstancePool,
  isStr,
  SequentialPool,
  Component,
  Wrapper,
  wrap
};
