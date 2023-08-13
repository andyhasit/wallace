const {JSDOM} = require( 'jsdom')
const {readCode} = require('../utils/babel')
const {config} = require('../config')
const {NodeData} = require('../definitions/node_data')
const {addInlineWatches} = require('../parse/inline_directives')
const {processDirective} = require('../config/parse_directives')


const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document

const directives = config.directives


class BaseConverter {
  constructor(componentName, path, astNode, nodeTreeAddress) {
    this.componentName = componentName
    this.path = path
    this.astNode = astNode
    this.nodeTreeAddress = nodeTreeAddress
    this.nodeData = new NodeData(componentName, path, nodeTreeAddress)
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
    // TODO: detect special tagname here.
    this.element = doc.createElement(tagName)
    openingElement.attributes.forEach(attr => {
      
      // TODO: this could be an expression!
      let name = attr.name.name 
      // console.log(name)
      if (name.startsWith('__')) {
        this.processNormalAttribute(attr, name.slice(1))
      } else if (name.startsWith('_')) {
        this.processDirective(attr, name.slice(1))      
      } else {
        this.processNormalAttribute(attr, name)
      }
    })
  }
  /**
   * A normal attribute 
   * 
   *   <div class="foo">
   *   <div class={foo}>
   * 
   * It may have directives inside the text: 
   * 
   *   <div class="{foo} bar">
   * 
   * This is a carry over from old HTML system, not sure if we're keeping it.
   */
  processNormalAttribute (att, name) {
    const attValue = this.attValue(att, true)
    /*
    Find a better way to handle this, as it generates this if we don't change to css:

      w["class"](n);

    If we don't do this, which is not what we want.
    */ 
    let usedKey = name === 'class' ? 'css' : `@${name}`
    const hasInlineDirective = addInlineWatches(this.nodeData, attValue, usedKey, false)

    if (!hasInlineDirective) {
      this.element.setAttribute(name, attValue)
    }
  }
  getDirective = (name) => {
    if (name.startsWith('on')) {
      const event = name.slice(2)
      return {
        params: 'callbackStr',
        handle: function(callbackStr) {
          this.addEventListener(event, callbackStr)
        }
      }
    }
    return directives[name]
  }
  processDirective = (att, name) => {
    const directiveCallback = this.getDirective(name.toLocaleLowerCase())
    if (!directiveCallback) {
      throw this.path.buildCodeFrameError(`Unknown directive: ${name}`)  
    }
    // TODO: split into chunks here so we can raise error?
    let attValue = this.attValue(att, false)
    
    processDirective(this.nodeData, name, directiveCallback, attValue)
  }
  attValue = (att, asInline) => {
    const attValue = this.readCode(att.value)
    if (attValue.startsWith('"') && attValue.endsWith('"')) {
      return attValue.slice(1, -1)
    }
    if (!asInline && attValue.startsWith('{') && attValue.endsWith('}')) {
      return attValue.slice(1, -1) 
    }
    // assert there is nothing weird?
    return attValue
  }
}


const converterClasses = {
  JSXText: JSXTextConverter,
  JSXExpressionContainer: JSXExpressionConverter,
  JSXElement: JSXElementConverter
}


const extractNodeData = (componentName, path, astNode, nodeTreeAddress) => {
  const cls = converterClasses[astNode.type]
  if (!cls) {
    throw this.path.buildCodeFrameError(`Unexpected node type: ${astNode.type}`)
  }
  const converter = new cls(componentName, path, astNode, nodeTreeAddress)
  converter.convert()
  return {element: converter.element, nodeData: converter.nodeData}
}


module.exports = {extractNodeData}