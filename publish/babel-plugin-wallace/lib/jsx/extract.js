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
    this.element = doc.createTextNode(this.astNode.value)
    addInlineWatches(this.nodeData, this.astNode.value, 'text', true)
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

    this.nodeData.attributes.forEach(attr => {
      if (attr.isDirective) {
        this.processDirective(attr)
      } else {
        this.processNormalAttribute(attr.name, attr.value)
      }
    })

    // TODO: check siblings and children
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
  processNormalAttribute(name, value) {
    const hasInlineDirective = addInlineWatches(this.nodeData, value, `@${name}`, false)
    if (!hasInlineDirective) {
      this.element.setAttribute(name, value)
    }
  }
  processDirective = (attr) => {
    const directiveName = attr.name.toLowerCase()
    if (!directives.hasOwnProperty(directiveName)) {
      throw this.path.buildCodeFrameError(`Unknown directive "${directiveName}".`)
    }
    const directive = directives[directiveName]
    if (!directive.allowedTypes.includes(attr.argType)) {
      throw this.path.buildCodeFrameError(`Directive "${directiveName}" does not allow arg type "${attr.argType}".`)
    }
    // TODO: validate against argsets and map to names
    directive.handle(this.nodeData, attr)
  }
}


/**
 * A normal attribute looks like:
 * 
 *   <div name>
 *   <div name="value">
 *   <div name={expr}>
 *   <div namespace:name>
 *   <div __name>
 * 
 * The __ allows normal attributes with _ to not be treaded as directives, so it
 * becomes this in the HTML: 
 *  
 *   <div _name>
 * 
 * A directive looks like:
 * 
 *   <div _name>
 *   <div _name="value">
 *   <div _name={expr}>
 *   <div _namespace:name>
 * 
 * For now, normal attributes may have directives inside the text: 
 * 
 *   <div class="{foo} bar">
 * 
 * This is a carry over from old HTML system, not sure if we're keeping it.
 */
class AttributeInfo {
  constructor(path, attr) {
    this.path = path
    this.astAttribute = attr
    this.name = undefined
    this.nestedClass = undefined
    this.qualifier = undefined
    this.isDirective = false
    this.argType = undefined
    this.value = undefined
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
    if (this.name.startsWith("__")) {
      this.name = this.name.slice(1)
    } else if (this.name.startsWith("_")) {
      this.isDirective = true
    }
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