const EOL = require('os').EOL
const wallaceDefs = ['__html__', '__clone__', '__stubs__']

/**
 * The character on which to split attributes and inlines
 */
const splitter = '|'

/**
 * The args string for watch callbacks.
 */
const watchArgs = '(n, o)'

/**
 * The parameters for various callback functions.
 * The letters mean:
 * 
 *  newValue
 *  oldValue
 *  wrapper
 *  props
 *  component
 *  event
 */
const allVariableLetters = ['n', 'o', 'w', 'p', 'c', 'e']
const watchCallbackArgsWithValue = 'n, o, w, p, c'
const watchCallbackArgsWithoutValue = 'w, p, c'
const lookupCallbackArgs = 'c, p'
const propsCallbackArgs = 'c, p'
const eventCallbackArgs = 'w, e'

// The component itself still needs to see this as '*'
const lookupAlwaysUpdate = "*"; 
const alwaysUpdate = 'A'; 
const neverUpdate = 'N';

/**
 * The name of the arg representing the component in the buildComponent method.
 */
const componentRefInBuild = 'component'
const callableWatchArgs = `${componentRefInBuild}, props`
const componentRefVariable = 'c'; // The variable name by which the component will be known.

function FrameworkError (msg) {
  this.msg = msg
}

function RequestsHelp (topic) {
  this.topic = topic
}

FrameworkError.prototype = new Error();

module.exports = {
  allVariableLetters,
  EOL,
  callableWatchArgs,
  componentRefVariable,
  alwaysUpdate,
  neverUpdate,
  lookupAlwaysUpdate,
  FrameworkError,
  eventCallbackArgs,
  wallaceDefs, 
  splitter,
  componentRefInBuild,
  lookupCallbackArgs,
  propsCallbackArgs,
  RequestsHelp,
  watchArgs,
  watchCallbackArgsWithValue,
  watchCallbackArgsWithoutValue
}