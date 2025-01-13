import { Component } from "./component";
import { Lookup } from "./lookup";
import { buildComponent, replaceNode } from "./utils";
import { KeyedPool, SequentialPool } from "./pool";
const throwAway = document.createElement("template");

/**
 * Create an element from html string
 */
function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild;
}

export const getProps = (component) => {
  return component.props;
};

export const findElement = (rootElement, path) => {
  return path.reduce((acc, index) => acc.childNodes[index], rootElement);
};

export const nestComponent = (rootElement, path, cls, parent) => {
  const el = findElement(rootElement, path),
    child = buildComponent(cls, parent);
  replaceNode(el, child.el);
  child.init();
  return child;
};

/**
 * Saves a reference to element or nested component. Can be used to wrap a stash call.
 */
export const saveRef = (element, component, name) => {
  component.ref[name] = element;
  return element;
};

/**
 * Saves a misc object (anything that's not an element). Can be used to wrap a stash call.
 */
export const saveMiscObject = (element, component, object) => {
  component._mo.push(object);
  return element;
};

export const onEvent = (element, eventName, callback) => {
  element.addEventListener(eventName, callback);
  return element;
};

/**
 * Creates a pool.
 */
export const getKeyedPool = (cls, keyFn) => {
  return new KeyedPool(cls, keyFn);
};

export const getSequentialPool = (cls) => {
  return new SequentialPool(cls);
};

export function defineComponent(
  html,
  watches,
  lookups,
  buildFunction,
  inheritFrom,
  prototypeExtras,
) {
  const Constructor = extendPrototype(
    inheritFrom || Component,
    prototypeExtras,
  );
  extendComponent(Constructor.prototype, html, watches, lookups, buildFunction);
  return Constructor;
}

export function extendComponent(
  prototype,
  html,
  watches,
  lookups,
  buildFunction,
) {
  prototype.__wc = watches.map((arr) => ({
    wk: arr[0], // The key of the corresponding element.
    sq: arr[1], // The shield query key
    rv: arr[2], // whether shieldQuery should be flipped
    sc: arr[3], // The number of items to shield
    cb: arr[4], // The callbacks - object
  }));
  prototype.__lu = new Lookup(lookups);
  prototype.__bv = buildFunction;
  prototype.__cn = makeEl(html);
}

export function extendPrototype(base, prototypeExtras) {
  const Constructor = function (parent) {
    base.call(this, parent);
  };
  Constructor.prototype = Object.create(base && base.prototype, {
    constructor: {
      value: Constructor,
      writable: true,
      configurable: true,
    },
  });
  Object.assign(Constructor.prototype, prototypeExtras);
  return Constructor;
}

/**
 
RETHINK THESE...

 * Move the component to new parent. Necessary if sharing a pool.

export const moveComponent = (component, newParent) => {
  throw new Error("Not implemented.");
  // if (component.parent && component.parent.__nc) {
  //   const nv = component.parent.__nc;
  //   nv.splice(nv.indexOf(component), 1);
  // }
  // component.parent = newParent;
};

export const nest = function (cls, props) {
  const child = createComponent(cls, this, props || this.props);
  this.__nc.push(child);
  return child;
};


 */

/**
 * Calls a function somewhere up the parent tree.
 */
export function bubble(component, name) {
  let target = component.parent;
  while (target) {
    let func = target[name];
    if (func) {
      // We don't really care about performance here, so accessing arguments is fine.
      // TODO: maybe we do care, so pass as array?
      // Use proxy?
      return func.apply(target, Array.prototype.slice.call(arguments, 1));
    }
    target = target.parent;
  }
  throw new Error("Bubble popped.");
}
