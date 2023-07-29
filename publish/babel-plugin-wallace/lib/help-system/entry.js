const fs = require('fs')
const path = require('path')
const {config} = require('../config/base_config')
const {extractDocumentation} = require('../config/parse_directives')
const {escapeDoubleQuotes} = require('../utils/misc')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement
} = require('../generate/statement_builders')

/**
 * These two files are raw code which we'll insert into the bundle.
 */
const browserFunctionsFile = path.join(__dirname, 'browser-code.js')
const cssFile = path.join(__dirname, 'styles.css')


/**
 * Builds the statements which load interactive help in the browser.
 * 
 * @param {string} topic - the initial topic to scroll to.
 */
const buildHelpLoaderStatements = (topic) => {
  /**
   * Could convert into IIFE, but that's extra work. 
   * And maybe we want to always include it and allow users to call it from console.
   */
  const showHelpFunction = new FunctionStatement('topic', buildHelpFunctionLines())
  const callHelpFuntion = new CallStatement('__help__', [`'${topic}'`])
  return [
    showHelpFunction.buildAssign(`var __help__`),   // __help__ = function(...){...}
    callHelpFuntion.buildValue()                    // __help__('the-topic')
  ]
}

const buildHelpFunctionLines = () => {

  // Add the nested functions...
  const lines = extractLines(browserFunctionsFile)
  
  // Build the local CSS variable...
  lines.push(`var helpPageCss = "${cssAsString(cssFile)}"`)

  // Build the directives variable...
  const directives = buildArrayOfDirectiveDocs()
  lines.push(directives.buildAssign(`var directives`))

  // And finally load the page...
  lines.push(`loadHelpPage(topic)`)
  return lines
}

/**
 * Returns array of strings from file.
 * @param {string} file 
 */
const extractLines = (file) => fs.readFileSync(file).toString().split("\n").filter(i => ! i.startsWith('//'));

const cssAsString = (file) => escapeDoubleQuotes(fs.readFileSync(file).toString().replace(/\n/g, ""))


const buildArrayOfDirectiveDocs = () => {
  const directives = new ArrayStatement()
  for (let [name, directive] of Object.entries(config.directives)) {
    let docObject = buildDirectiveDocsObject(name, directive)
    directives.add(docObject.buildValue())
  }
  return directives
}

/**
 * Builds a docs object that can be inserted straight into the array.
 * @param {string} name - the name of the directive.
 * @param {object} directive - the directive definition object.
 */
const buildDirectiveDocsObject = (name, directive) => {
  let directiveDocs = extractDocumentation(name, directive)
  let docObjectStatement = new ObjectStatement()
  for (let [key, value] of Object.entries(directiveDocs)) {
    if (value) {
      // TODO: assumes all are strings. Will need to change this...
      // Maybe use babel ast instead?
      value = `"${escapeDoubleQuotes(value)}"`
    }
    docObjectStatement.add(key, value)
  }
  return docObjectStatement
}

module.exports = {buildHelpLoaderStatements}