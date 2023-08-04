const {getLookupArgs, stripHtml} = require('../utils/dom')
const {escapeSingleQuotes, extractShieldCounts, groupArray, isUnd} = require('../utils/misc')
const {
  componentRefInBuild, 
  lookupCallbackArgs,
  propsCallbackArgs,
  watchCallbackArgsWithValue,
  watchCallbackArgsWithoutValue,
  FrameworkError
} = require('../definitions/constants')

const {DomWalker} = require('../parse/dom_walker.js')
const {extractNodeData} = require('../parse/parse_node')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./statement_builders')

const re_lnu = /^\w+$/; // letters_numbers_underscores

const vars = {
  getWatch: '__wa',
  getLookup: '__lu',
}

/**
 * Builds all the generated statements for a Wallace Component.
 * Deals with:
 *
 *  - Building the fields and methods for the prototype
 *  - Tracking state during the parsing (e.g. next DOMRef, and shielding)
 *
 */
class CodeGenerator {
  constructor(className, processAsStub) {
    this.className = className
    this.rawHTML = undefined

    this.prototypeVariable = `${className}_prototype`
    this.processAsStub = processAsStub
    this.nextElementRefIndex = 0
    this.savedWatchCallArgs = []

    // These are used in the buildMethod
    this.savedElements = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.htmlString = new ValueStatement()
    this.buildMethod = new FunctionStatement(`${componentRefInBuild}, prototype`)
    this.watches = new ArrayStatement()
    this.protoLookupCallbacks = new ObjectStatement()
    this.nestedComponentProps = new ObjectStatement()
    this.createLookupCall = new CallStatement(`${this.prototypeVariable}.${vars.getLookup}`)
    this.createLookupCall.add(this.protoLookupCallbacks)
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
    this.postParsing()
    const statements = [
      `var ${this.prototypeVariable} = ${this.className}.prototype;`,
      this.htmlString.buildAssign(`${this.prototypeVariable}.__ht`),
      this.watches.buildAssign(`${this.prototypeVariable}.__wc`),
      this.createLookupCall.buildAssign(`${this.prototypeVariable}.__qc`),
      this.nestedComponentProps.buildAssign(`${this.prototypeVariable}.__ip`),
      this.buildMethod.buildAssign(`${this.prototypeVariable}.__bv`),
    ]
    statements.push(new ValueStatement('undefined').buildAssign(`${this.prototypeVariable}.__cn`))
    return statements
  }
  /**
   * Consolidates various bits after parsing.
   */
  postParsing() {
    this.setShieldCounts()
    this.buildMethod.add(`${componentRefInBuild}.__bd(prototype)`)
    this.beforeSave.forEach(i => this.buildMethod.add(i))
    this.buildMethod.add(this.savedElements.buildAssign(`${componentRefInBuild}.el`))
    this.afterSave.forEach(i => this.buildMethod.add(i))
    // We do this at the end as the dom has been changed
    const convertedHTML = this.buildHtmlString(this.rawHTML)
    this.htmlString.set(`'${convertedHTML}'`)
  }
  /**
   * Converts the raw HTML text from the DOM
   */
  buildHtmlString(rawHtml) {
    return escapeSingleQuotes(stripHtml(rawHtml))
  }
  /**
   * Sets the shieldCounts, which has to be done after parsing as nodes
   * can't know how many child nodes they will have at point of being
   * parsed.
   */
  setShieldCounts() {
    const shieldCountArgIndex = 3
    const nodePathOfEachWatchCall = this.savedWatchCallArgs.map(i => i.nodeTreeAddress)
    const shieldCountForEachWatchCall = extractShieldCounts(nodePathOfEachWatchCall)
    for (const [i, argSet] of this.savedWatchCallArgs.entries()) {
      argSet.watchCallArgs[shieldCountArgIndex] = shieldCountForEachWatchCall[i]
    }
  }
  /**
   * Saves the watchCallArgs against the nodeTreeAddress, which well use in watchCallArgs
   */
  saveWatchCallArgs(nodeTreeAddress, watchCallArgs) {
    // The first element is undefined, which we don't need here.
    nodeTreeAddress = nodeTreeAddress.slice(1)
    this.savedWatchCallArgs.push({nodeTreeAddress, watchCallArgs})
  }
  /**
   * Processes a node which has directives, which could be a JSXElement, JSText or JSExpression?
   */
  processNodeWithDirectives(nodeData, nodeTreeAddress) {
    let {
      additionalLookups,
      afterSave,
      beforeSave,
      saveAs,
      props,
      shieldQuery,
      reverseShield,
      watches,
      stubName,
      replaceWith
    } = nodeData

    // If this node is a "stub", save it and because there's nothing to do stubs.
    if (stubName) {
      this.saveStub(stubName, nodeTreeAddress)
      return
    }

    // Use the saveAs supplied, or get a sequential one
    // TODO: warn if starts with '___'
    saveAs = saveAs ? saveAs : this.getNextElementRef()

    // If replaceWith, then it's a nested component, which needs special treatment.
    if (replaceWith) {
      this.saveNestedComponent(nodeTreeAddress, saveAs, nodeData, replaceWith, props, replaceWith)
    } else {
      // TODO: do we always want to save the wrapper?
      this.saveWrapper(nodeTreeAddress, saveAs, nodeData)
    }

    // Ensure the shieldQuery gets added
    // This is the query to determine whether the wrappers should shield
    // nested wrappers
    shieldQuery = nodeData.expandValueSlot(shieldQuery)
    if (shieldQuery) {
      this.addWatchQueryCallback(shieldQuery)
    }
    // Use the shieldQuery supplied, 0 (must set as string here)
    shieldQuery = shieldQuery ? `'${shieldQuery}'` : '0'

    // shieldCount is the number of wrappers to shield, which will equate to the
    // number of wrappers nested underneath, which we have to calculate postParsing
    // so we just set it to 0 for now.
    const defaultShieldCount = 0


    const watchCallbacks = this.buildWatcherCallbacksObject(watches)
    const watchCallArgs = [
      `'${saveAs}'`,
      shieldQuery,
      reverseShield.toString(),
      defaultShieldCount,  // shieldCount is at position 3 - if this changes we must change setShieldCounts!
      watchCallbacks
    ]
    // We save this as we're going to need it postParsing to set the shieldCount
    // Must slice the nodeTreeAddress!
    this.saveWatchCallArgs(nodeTreeAddress.slice(), watchCallArgs)

    // TODO: change this, as we may call different functions to make simpler watchers
    const watchCall = new CallStatement(`${this.prototypeVariable}.${vars.getWatch}`, watchCallArgs)
    this.watches.add(watchCall)

    for (const [lookupKey, statement] of Object.entries(additionalLookups)) {
      this.addLookupEntry(lookupKey, statement)
    }
  }
  /**
   * Builds the object with callbacks for the watcher.
   * 
   * @param {Array} watches 
   */
  buildWatcherCallbacksObject(watches) {
    const callbacksObject = new ObjectStatement()
    // TODO maybe do this before so we can alias the names ?
    const callbackLinesroupedByWatchedField = groupArray(watches, 'watch', details => details)
    for (let [watch, lines] of Object.entries(callbackLinesroupedByWatchedField)) {
      this.addWatchQueryCallback(watch)
      let callbackArgs = watch === '*' ? watchCallbackArgsWithoutValue : watchCallbackArgsWithValue
      let callback = this.buildWatcherCallbackFunction(callbackArgs, lines)
      callbacksObject.add(watch, callback)
    }
    return callbacksObject
  }
  /**
   * 
   * @param {String} callbackArgs 
   * @param {Array} lines 
   * 
   * 
   */
  buildWatcherCallbackFunction(callbackArgs, lines) {
    // TODO: perhaps optimise to generate a function if it is simple.
    let callback = new FunctionStatement(callbackArgs)
    
    // Find lines which call methods on the wrapper so we can chain them.
    const methodLines = lines.filter(line => line.wrapperMethod)
    
    // TODO: handle lookups in here too
    if (methodLines.length > 0) {
      let chainedCalls = 'w'
      methodLines.forEach(line => {
        
        let [methodName, firstArg] = line.wrapperMethod.split(':')
        const methodArgs = []
        // Handle method name being "@style", which would make it att('style')
        if (methodName.startsWith('@')) {
          methodArgs.push(`'${methodName.substr(1)}'`)
          methodName = 'att'
        }

        if (firstArg) {
          methodArgs.push(`'${firstArg}'`)
        }

        methodArgs.push(this.buildWrapperValueArg(line))
        if (line.extraArg) {
          methodArgs.push(line.extraArg)
        }
        chainedCalls += `.${methodName}(${methodArgs.join(',')})`
      })
      callback.add(chainedCalls)
    }

    const nonMethodLines = lines.filter(line => !line.wrapperMethod)
    nonMethodLines.forEach(line => callback.add(line.converter))
    return callback
  }
  /**
   * Builds the value argument for a wrapper method call.
   * This will typically end up as the first argument, but may be the second in case
   * it's a call to wrapper.att().
   * 
   * @param {Watcher} watcher 
   */
  buildWrapperValueArg(watcher) {
    if (watcher.lookup) {
      return `c.lookup('${watcher.lookup}').n`
    }
    return watcher.converter || 'n'
  }
  /**
   * Add a saved Element.
   */
  saveWrapper(nodeTreeAddress, saveAs, nodeData) {
    this.saveElement(saveAs, this.buildWrapperInitCall(nodeData, nodeTreeAddress), nodeData.chainedCalls)
  }
  /**
   * Returns the call for creating a new wrapper based on nodeTreeAddress.
   *
   * If customWrapperClass is provided, it is initiated with new, and the class better
   * be in scope. That is why we do it with new here rather than passing the class
   * to __gw or so.
   * Similarly, that is why we use __gw, because we know "Wrapper" will be in scope
   * there, but it isn't guaranteed to be where componentRefInBuild is defined.
   *
   */
  buildWrapperInitCall(nodeData, nodeTreeAddress) {
    const path = getLookupArgs(nodeTreeAddress)
    if (nodeData.wrapperOverride) {
      return nodeData.wrapperOverride
    } else if (nodeData.customWrapperClass) {
      const args = nodeData.customWrapperArgs ? ',' + nodeData.customWrapperArgs : ''
      return `new ${nodeData.customWrapperClass}(${componentRefInBuild}.__fe(${path})${args})`
    }
    return `${componentRefInBuild}.__gw(${path})`
  }
  saveNestedComponent(nodeTreeAddress, saveAs, nodeData, tagName, props, replaceWith) {
    const nestedComponentClass = replaceWith || tagName
    if (props) {
      this.nestedComponentProps.add(saveAs, new FunctionStatement(propsCallbackArgs, [`return ${props}`]))
    } else {
      this.nestedComponentProps.add(saveAs, '0')
    }
    const initCall = `${componentRefInBuild}.__ni(${getLookupArgs(nodeTreeAddress)}, ${nestedComponentClass})`
    this.saveElement(saveAs, initCall, nodeData.chainedCalls)
  }
  saveStub(stubName, nodeTreeAddress) {
    if (!re_lnu.test(stubName)) {
      this.walker.throw('Stub name may only contain letters numbers and underscores')
    }
    this.nestedComponentProps.add(stubName, new FunctionStatement(propsCallbackArgs, ['return c.props']))
    const initCall = `${componentRefInBuild}.__ni(${getLookupArgs(nodeTreeAddress)}, this.__stubs__${stubName})`
    this.saveElement(stubName, initCall, [])
  }
  saveElement(saveAs, initCall, chainedCalls) {
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.savedElements.add(saveAs, `${initCall}${chainedCallStatement}`)
  }
  addWatchQueryCallback(watch) {
    if (watch !== '*') {
      this.addLookupEntry(watch, watch)
    }
  }
  /**
   * Adds an entry to the lookups
   */
  addLookupEntry(watch, statement) {
    /*
    TODO: fail, or warn if watch is not in scope (if not, babel does very funny stuff!)
    split string on "." and use first, but not if it is raw Js?
    Or one if it is a word followed by ".", "[" or "("

    Same will happen with callbacks?
    */
    const callback = (watch === '' || watch === undefined) ?
      `function() {return null}` :
      `function(${lookupCallbackArgs}) {return ${statement}}`
    this.protoLookupCallbacks.add(watch, callback)
    
  }
  /**
   * Gets next name for saving elements.
   */
  getNextElementRef() {
    this.nextElementRefIndex ++
    return `_${this.nextElementRefIndex}`
  }
}

module.exports = {CodeGenerator}