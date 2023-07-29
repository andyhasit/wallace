import {doc} from './helpers'


/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */
export function Wrapper(element) {
  this.e = element
  this._pool = undefined
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
    this.e.appendChild(this.__ge(item))
    return this
  },
  att: function(name, value) {
    this.e.setAttribute(name, value)
    return this
  },
  atts: function(atts) {
    for (let name in atts) {
      this.att(name, atts[name])
    }
    return this
  },
  pool: function(pool) {
    this._pool = pool
    return this
  },
  clear: function() {
    this.e.innerHTML = ''
    this.e.textContent = ''
    this.e.value = ''
    return this
  },
  checked: function(value) {
    this.e.checked = !!value
    return this
  },
  child: function(wrapper) {
    this.e.innerHTML = ''
    this.e.appendChild(wrapper.e)
    return this
  },
  css: function(style) {
    this.e.className = style
    return this
  },
  cssAdd: function(style) {
    this.e.classList.add(style)
    return this
  },
  cssRemove: function(style) {
    this.e.classList.remove(style)
    return this
  },
  cssToggle: function(style) {
    this.e.classList.toggle(style)
    return this
  },
  disabled: function(disabled) {
    this.e.disabled = disabled
    return this
  },
  href: function(value) {
    return this.att('href', value)
  },
  html: function(html) {
    this.e.innerHTML = html
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
      items = [items]
    }
    const e = this.e
    e.innerHTML = ''
    for (var i=0, il=items.length; i<il; i++) {
      e.appendChild(this.__ge(items[i]))
    }
    return this
  },
  /*
   * Set items from pool.
   */
  items: function(items, parent) {
    this._pool.patch(this.e, items, parent)
    return this
  },
  on: function(event, callback) {
    this.e.addEventListener(event, e => callback(this, e))
    return this
  },
  replace: function(el) {
    this.e.parentNode.replaceChild(el, this.e)
    return this
  },
  src: function(value) {
    return this.att('src', value)
  },
  style: function(name, value) {
    this.e.style[name] = value
    return this
  },
  swap: function(key, parent) {
    this.child(this._pool.getOne(key, parent))
    return this
  },
  text: function(value) {
    this.e.textContent = value
    return this
  },
  visible: function(visible) {
    this.e.classList.toggle('hidden', !visible)
    return this
  },
  value: function(value) {
    this.e.value = value
    return this
  }
}