const {JSDOM} = require( 'jsdom')
const {readCode} = require('../utils/babel')
const {config} = require('../config')
const {NodeData} = require('../definitions/node_data')
const {addInlineWatches} = require('../parse/inline_directives')
const {processDirective} = require('../config/parse_directives')


const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document
const splitter = "-----"
const directives = config.directives
const isCapitalized = word => word[0] === word[0].toUpperCase()


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
    const tagName = openingElement.name.name

    if (isCapitalized(tagName)) {

    }
    // TODO: detect special tagname here.
    this.element = doc.createElement(tagName)


    /*
    Parse attributes into an array, save on NodeData, then loop through,
    because each directive may want to inspect.
    We also want to block Component tags from having certain attributes.

    So maybe:
      1. Extract attributes
      2. Examine tag name and do special things in those cases.
      3. Go over directives

    */

    // Can't put error against attribute. Maybe I need to visit?
    this.nodeData.attributes = openingElement.attributes.map(attr => new AttributeInfo(this.path, attr))
    this.nodeData.attributeNames = this.nodeData.attributes.map(attr => attr.name)
    this.nodeData.attributes.forEach(attr => {
      if (attr.isDirective) {
        this.processDirective(attr)
      } else {
        this.processNormalAttribute(attr.name, attr.value)
      }
    })
  }
  processNormalAttribute(name, value) {
    /*
    Find a better way to handle this, as it generates this if we don't change to css:

      w["class"](n);

    If we don't do this, which is not what we want.
    */ 
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
    if (name.type === 'JSXIdentifier') {
      this.name = name.name
    } else if (name.type === 'JSXNamespacedName') {
      this.name = name.namespace.name
      this.qualifier = name.name.name
    } else {
      throw this.path.buildCodeFrameError(`Unknown attribute name type: ${name.type}`)
    }
    if (this.name.startsWith('__')) {
      this.name = this.name.slice(1)
    } else if (this.name.startsWith('_')) {
      this.isDirective = true
      this.name = this.name.slice(1)
    }
  }
  processValue() {
    const value = this.astAttribute.value
    if (value === null) {
      this.arg = null
      this.argType = "null"
    }
    else if (value.type === 'StringLiteral') {
      this.value = value.value
      this.argType = "str"
    }
    else if (value.type === 'JSXExpressionContainer') {
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