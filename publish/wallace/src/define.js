import {Component} from './component'

/**
 * Function for defining a component.
 * 
 * @param {function} opts               An object with options.
 * @param {object}   opts.base          An object with extra things to be added to the prototype
 * @param {object}   opts.proto         An object with extra things to be added to the prototype
 * @param {function} opts.constructor   A function to be used as constructor
 */
export function define(opts) {
  var base = opts._base || Component
  // TODO: do we care about allowing this?
  // var NewComponent = opts.hasOwnProperty('constructor') ? opts.constructor : function(parent) {
  var NewComponent = function(parent) {
    base.call(this, parent)
  }
  delete opts._base
  NewComponent.prototype = Object.create(base && base.prototype, {
    constructor: { value: NewComponent, writable: true, configurable: true }
  })
  Object.assign(NewComponent.prototype, opts)
  return NewComponent
}
