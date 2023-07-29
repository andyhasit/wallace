
/**
 * Constructor for watcher object.
 * 
 * @param {string} watch - the field or wrapperMethod to watch.
 * @param {string} [converter] - the converter*
 * @param {string} [wrapperMethod] - the method on the wrapper* 
 * @param {string} [extraArg] - And extra argument to pass to the wrapperMethod
 * @param {string} [lookup] - name of the lookup to use. 
 * 
 * All arguments passed in must have dots expanded already.
 * 
 * - The converter will become a free function call if no wrapperMethod supplied.
 * - The wrapperMethod may use "@attName" syntax.
 * - Lookup and converter are mutually exclusive - only one must be supplied.
 * 
 */
function Watcher(watch, converter, wrapperMethod, extraArg, lookup) {
  this.watch = watch || ''
  this.converter = converter
  this.wrapperMethod = wrapperMethod
  this.extraArg = extraArg
  this.lookup = lookup
}

module.exports = {Watcher}