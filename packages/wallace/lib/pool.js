import { createComponent } from "./utils";

/*
 * Gets a component from the pool.
 */
const getComponent = (pool, componentClass, key, item, parent) => {
  let component;
  if (pool.hasOwnProperty(key)) {
    component = pool[key];
    component.setProps(item);
  } else {
    component = createComponent(componentClass, parent, item);
    pool[key] = component;
  }
  return component;
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
  for (let i = lastIndex; i > keepIndex; i--) {
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
 * Pools same type components, retrieving by key.
 * Must not be shared.
 *
 * @param {class} componentClass - The class of Component to create.
 * @param {function} keyFn - A function which obtains the key to pool by
 */
export function KeyedPool(componentClass, keyFn) {
  this._v = componentClass;
  this._f = keyFn;
  this._k = []; // keys
  this._p = {}; // pool of component instances
}
const proto = KeyedPool.prototype;

/**
 * Retrieves a single component. Though not used in wallace itself, it may
 * be used elsewhere, such as in the router.
 *
 * @param {Object} item - The item which will be passed as props.
 * @param {Component} parent - The parent component.
 */
proto.getOne = function (item, parent) {
  return getComponent(this._p, this._v, this._f(item), item, parent);
};

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Component} parent - The parent component.
 */
proto.patch = function (e, items, parent) {
  // Attempt to speed up by reducing lookups. Does this even do anything?
  // Does webpack undo this/do it for for me? Does the engine?
  const pool = this._p;
  const componentClass = this._v;
  const keyFn = this._f;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  const oldKeySequence = this._k;
  const newKeys = [];
  let item,
    key,
    component,
    childElementCount = oldKeySequence.length + 1;
  for (let i = 0; i < itemsLength; i++) {
    item = items[i];
    key = keyFn(item);
    component = getComponent(pool, componentClass, key, item, parent);
    newKeys.push(key);
    if (i > childElementCount) {
      e.appendChild(component.el);
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(component.el, childNodes[i]);
      pull(oldKeySequence, key, i);
    }
  }
  this._k = newKeys;
  trimChildren(e, childNodes, itemsLength);
};

/**
 * Pools same type components, retrieving by sequence.
 *
 * @param {class} componentClass - The class of Component to create.
 */
export function SequentialPool(componentClass) {
  this._v = componentClass;
  this._p = []; // pool of component instances
  this._c = 0; // Child element count
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Component} parent - The parent component.
 */
SequentialPool.prototype.patch = function (e, items, parent) {
  const pool = this._p;
  const componentClass = this._v;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  let item,
    component,
    poolCount = pool.length,
    childElementCount = this._c;

  for (let i = 0; i < itemsLength; i++) {
    item = items[i];
    if (i < poolCount) {
      component = pool[i];
      component.setProps(item);
    } else {
      component = createComponent(componentClass, parent, item);
      pool.push(component);
      poolCount++;
    }
    if (i >= childElementCount) {
      e.appendChild(component.el);
    }
  }
  this._c = itemsLength;
  trimChildren(e, childNodes, itemsLength);
};
