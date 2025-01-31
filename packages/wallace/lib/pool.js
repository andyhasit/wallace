import { createComponent } from "./utils";

/*
 * Gets a component from the pool.
 */
function getComponent(pool, componentDefinition, key, item, parent) {
  let component;
  if (pool.hasOwnProperty(key)) {
    component = pool[key];
    component.render(item);
  } else {
    component = createComponent(componentDefinition, parent, item);
    pool[key] = component;
  }
  return component;
}

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
 * @param {class} componentDefinition - The class of Component to create.
 * @param {function} keyFn - A function which obtains the key to pool by.
 */
export function KeyedPool(componentDefinition, keyFn, pool) {
  this._d = componentDefinition;
  this._f = keyFn;
  this._k = []; // keys
  this._p = pool || {}; // pool of component instances
}

/**
 * Retrieves a single component. Though not used in wallace itself, it may
 * be used elsewhere, such as in the router.
 *
 * @param {Object} props - The props object.
 * @param {Component} parent - The parent component.
 */
KeyedPool.prototype.getOne = function (props, parent) {
  return getComponent(this._p, this._d, this._f(props), props, parent);
};

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Component} parent - The parent component.
 */
KeyedPool.prototype.patch = function (e, items, parent) {
  // Attempt to speed up by reducing lookups. Does this even do anything?
  // Does webpack undo this/do it for for me? Does the engine?
  const pool = this._p;
  const componentDefinition = this._d;
  const keyFn = this._f;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  const oldKeySequence = this._k;
  const newKeys = [];
  let props,
    key,
    component,
    childElementCount = oldKeySequence.length + 1;
  for (let i = 0; i < itemsLength; i++) {
    props = items[i];
    key = keyFn(props);
    component = getComponent(pool, componentDefinition, key, props, parent);
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
 * @param {class} componentDefinition - The class of Component to create.
 */
export function SequentialPool(componentDefinition) {
  this._d = componentDefinition;
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
  const componentDefinition = this._d;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  let props,
    component,
    poolCount = pool.length,
    childElementCount = this._c;

  for (let i = 0; i < itemsLength; i++) {
    props = items[i];
    if (i < poolCount) {
      component = pool[i];
      component.render(props);
    } else {
      component = createComponent(componentDefinition, parent, props);
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
