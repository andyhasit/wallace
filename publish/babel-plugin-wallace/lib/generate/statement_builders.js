/**
 * Tools for building generic JavaScript statements.
 */

const {EOL} = require('../definitions/constants')

function expand(value) {
  if (value instanceof BaseStatement) {
    return value.buildValue()
  }
  return value
}


class BaseStatement {
  /**
   * Builds the babel AST for an assignemen statement of the value.
   * Note that babel does its own adjustments with spaces, commas etc...
   */
  buildAssign(name) {
    return `${name} = ${this.buildValue()};`
  }
}


class ArrayStatement extends BaseStatement {
  constructor(items) {
    super()
    this.items = items || []
  }
  add(value) {
    this.items.push(value)
  }
  buildValue() {
    const lines = ['[']
    this.items.forEach(value => {
      lines.push(`${expand(value)},`)
    })
    lines.push(']')
    return lines.join(EOL)
  }
}

/**
 * Creates a call statement, where parameters are expanded.
 */
class CallStatement extends BaseStatement {
  /**
   * 
   * @param {string} call - e.g. "foo" or "foo.bar"
   * @param {array} args - the args to pass
   */
  constructor(call, args) {
    super()
    this.call = call
    this.args = args || []
  }
  add(value) {
    this.args.push(value)
  }
  buildValue() {
    const callArgs = this.args.map(i => expand(i)).join(', ')
    return this.call + '(' + callArgs + ')'
  }
}

class FunctionStatement extends BaseStatement {
  /**
   * 
   * @param {string} argString - a string 
   * @param {array} lines - the body lines
   */
  constructor(argString, lines) {
    super()
    this.argString = argString
    this.lines = lines || []
  }
  add(value) {
    this.lines.push(value)
  }
  buildValue() {
    const finalLines = [`function(${this.argString}) {`]
    this.lines.forEach(value => {
      finalLines.push(`${expand(value)}`)
    })
    finalLines.push('}')
    return finalLines.join(EOL)
  }
}


class ObjectStatement extends BaseStatement {
  constructor(entries) {
    super()
    this.entries = entries || {}
  }
  add(key, value) {
    this.entries[key] = value
  }
  buildValue() {
    const lines = ['{']
    for (let [key, value] of Object.entries(this.entries)) {
      lines.push(`'${key}': ${expand(value)},`)
    }
    lines.push('}')
    return lines.join(EOL)
  }
}


class ValueStatement extends BaseStatement {
  constructor(value) {
    super()
    this.value = value || 'undefined'
  }
  set(value) {
    this.value = value
  }
  buildValue() {
    return expand(this.value)
  }
}

module.exports = {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
}