const {JSDOM} = require( 'jsdom')
const {readCode} = require('../utils/babel')
const {config} = require('../config')
const {NodeData} = require('../definitions/node_data')
const {addInlineWatches} = require('../parse/inline_directives')

const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document
const splitter = "-----"
const directives = config.directives
const isCapitalized = word => word[0] === word[0].toUpperCase()
const onlyHas = (arr, item) => arr.length === 0 || arr.length === 1 && arr[0] === item


class BaseConverter {
  constructor(componentName, path, astNode, parentNodeData, nodeTreeAddress) {
    this.componentName = componentName
    this.path = path
    this.astNode = astNode
    this.parentNodeData = parentNodeData
    this.nodeTreeAddress = nodeTreeAddress
    this.nodeData = new NodeData(componentName, path, parentNodeData, nodeTreeAddress)
    this.element = undefined
  }
  readCode(astNode) {
    return readCode(this.path, astNode)
  }
}


class JSXTextConverter extends BaseConverter {
  convert() {
    // expressions in text become JSXExpressionContainers, so there is never dynamic 
    // data inside JSText.
    // Except that's currently not true due to how we squash. TODO: fix this.
    const text = this.astNode.value
    this.element = doc.createTextNode(text)
    // console.log(text)
    addInlineWatches(this.nodeData, text, 'text', true)
  }
}


class JSXExpressionConverter extends BaseConverter {
  convert() {
    // This only treats expressions in innerText, not attribute values.
    this.element = doc.createElement('text')
    this.element.textContent = '.'
    const code = this.readCode(this.astNode.expression)
    addInlineWatches(this.nodeData, `{${code}}`, 'text', true)
  }
}


class JSXElementConverter extends BaseConverter {
  convert() {
    const openingElement = this.astNode.openingElement
    let tagName = this.getTagName()

    // Can't put error against attribute. Maybe I need to visit?
    this.nodeData.attributes = openingElement.attributes.map(attr => new AttributeInfo(this.path, attr))
    this.nodeData.attributeNames = this.nodeData.attributes.map(attr => attr.name)
    
    this.element = doc.createElement(tagName)

    if (isCapitalized(tagName) || tagName.includes(".")) {
      this.nodeData.nestedClass = tagName
    }

    this.nodeData.attributes.forEach(attr => this.processAttribute(attr))

    // TODO: check siblings and children here or in directive (or NodeData.assertXYZ()..)
    if (this.nodeData.nestedClass) {
      if (this.nodeData.isRepeat) {
        this.element = null
      } else {
        this.element = doc.createElement("br")
        this.nodeData.replaceWith = tagName
      }
    }
  }
  getTagName() {
    // could be 'JSXMemberExpression' or 'JSXIdentifier', so just read as string.
    return this.readCode(this.astNode.openingElement.name)
  }
  processAttribute = (attr) => {
    const {argType, name, value} = attr
    const nameLowerCase = name.toLowerCase()

    const rule = config.rules.attributes[nameLowerCase]
    const error = rule && rule(attr)
    
    // TODO: allow warnings too?
    if (error) {
      throw this.path.buildCodeFrameError(error)
    }
    
    const directive = directives.hasOwnProperty(nameLowerCase) && directives[nameLowerCase]
    // console.log(name, argType, value, directive)
    if (directive && ! attr.escaped) {
      this.processDirective(directive, nameLowerCase, attr)
    } else {
      switch (argType) {
        case "expr":
          addInlineWatches(this.nodeData, value, `@${attr.fullName}`, false)
          break
        case "null":
          // TODO: this shows as <div disabled=""></div> which works in Chrome etc...
          // but its annoying for tests and compactness. Seems to be a JSDOM issue?
          this.element.setAttribute(attr.fullName, "")
          // this.element.setAttribute(name, null)
          // this.element[name] = true
          break
        case "str":
          this.element.setAttribute(attr.fullName, value)
          break
      }
    }
  }
  processDirective = (directive, directiveName, attr) => {
    const allowedArgTypes = directive.allow.split("|")
    if (!allowedArgTypes.includes(attr.argType)) {
      throw this.path.buildCodeFrameError(
        `Directive [${directiveName}] does not allow argument type: "${attr.argType}"`
      )
    }
    if (directive.qualifier === "no" && attr.qualifier) {
      throw this.path.buildCodeFrameError(
        `Directive [${directiveName}] does not allow a qualifier.`
      )
    }
    if (directive.qualifier === "yes" && !attr.qualifier) {
      throw this.path.buildCodeFrameError(
        `Directive [${directiveName}] requires a qualifier.`
      )
    }
    // TODO: parse args better.
    directive.handle(this.nodeData, attr)
  }
}


/**
 * An attribute could look like:
 * 
 *   <div name>
 *   <div name="value">
 *   <div name={expr}>
 *   <div namespace:name>
 *   <div _name>
 * 
 */
class AttributeInfo {
  constructor(path, attr) {
    this.path = path
    this.astAttribute = attr
    this.name = undefined
    this.nestedClass = undefined
    this.qualifier = undefined
    this.escaped = false
    this.argType = undefined
    this.value = undefined
    this.arg = undefined
    this.args = undefined
    this.processName()
    this.processValue()
  }
  processName() {
    const name = this.astAttribute.name
    if (name.type === "JSXIdentifier") {
      this.name = name.name
    } else if (name.type === "JSXNamespacedName") {
      this.name = name.namespace.name
      this.qualifier = name.name.name
    } else {
      throw this.path.buildCodeFrameError(`Unknown attribute name type: ${name.type}`)
    }
    if (this.name.startsWith("_")) {
      this.name = this.name.slice(1)
      this.escaped = true
    }
    this.fullName = this.name + (this.qualifier ? `:${this.qualifier}` : "")
  }
  processValue() {
    const value = this.astAttribute.value
    if (value === null) {
      this.arg = null
      this.argType = "null"
    }
    else if (value.type === "StringLiteral") {
      this.value = value.value
      this.argType = "str"
    }
    else if (value.type === "JSXExpressionContainer") {
      this.argType = "expr"
      // Detecting BinaryExpression through AST is a PITA. Strings are much simpler.
      const code = readCode(this.path, value.expression).replaceAll("||", splitter)
      this.args = code.split("|").map(x => x.replaceAll(splitter, "||").trim())
      this.arg = this.args[0]
      this.value = `{${readCode(this.path, value.expression)}}`
    }
  }
}


const converterClasses = {
  JSXText: JSXTextConverter,
  JSXExpressionContainer: JSXExpressionConverter,
  JSXElement: JSXElementConverter
}


const extractNodeData = (componentName, path, astNode, parentNodeData, nodeTreeAddress) => {
  const cls = converterClasses[astNode.type]
  if (!cls) {
    throw this.path.buildCodeFrameError(`Unexpected node type: ${astNode.type}`)
  }
  const converter = new cls(componentName, path, astNode, parentNodeData, nodeTreeAddress)
  converter.convert()
  return {element: converter.element, nodeData: converter.nodeData}
}


module.exports = {extractNodeData}