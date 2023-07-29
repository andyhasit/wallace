/**
 * This module deals with parsing the directives in the config file,
 * and helping them parse arguments.
 */

const {isFunc, isUnd, splitTrim} = require('../utils/misc')

/**
 * Used internally to 
 * 
 * @param {string} directiveName 
 * @param {*} directive 
 * @param {*} attVal 
 */
const processDirective = (nodeData, directiveName, directive, attVal) => {
  if (!isFunc(directive.handle)) {
    throw new Error('handle must be a function')
  }
  let args = attVal
  if (directive.hasOwnProperty('params')) {
    let params = splitTrim(directive.params, ',')
    args = parseDirectiveArguments(params, attVal)
    directive.handle.apply(nodeData, args)
  } else {
    directive.handle.apply(nodeData, [args])
  }
}

/**
 * Return array of args based on definitions
 *
 * @param {Array} params The parameters as strings
 * @param {String} attVal The raw attribute value.
 */
const parseDirectiveArguments = (params, attVal) => {
  const args = []
  const chunks = splitTrim(attVal, '|')
  for (let i=0, il=params.length; i<il; i++) {
    let param = params[i]
    let raw = chunks[i]
    let value = parseArgValue(param, raw, i)
    args.push(value)
  }
  return args
}

const parseArgValue = (param, raw, i) => {
  if ((!param.endsWith('?')) && (isUnd(raw))) {
    throw new Error(`Argument ${param} is required`)
  }
  return raw
}

const extractDocumentation = (name, directive) => {
  return {
    name: name,
    params: directive.params
  }
}



module.exports = {processDirective, extractDocumentation}