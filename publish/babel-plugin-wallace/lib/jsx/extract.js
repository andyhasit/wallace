const {JSDOM} = require( 'jsdom')
const {readCode} = require('../utils/babel')
const {config} = require('../config')
const {processDirective} = require('../config/parse_directives')


const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document

const directives = config.directives


const extractDynamicData = (path, astNode, domElement, nodeTreeAddress) => {
  const nodeData = new NodeData(domElement, nodeTreeAddress)
  let hasData = false

  // Check attributes for directives
  if (domElement.attributes && domElement.attributes.length > 0) {
    for (let [directiveName, directive] of Object.entries(config.directives)) {
      let attVal = getAttVal(domElement, directiveName)
      if (attVal) {
        // To deal with <use:Child/>
        if (attVal.endsWith('/')) {
          attVal = attVal.substring(0, attVal.length -1)
        }
        hasData = true
        processDirective(nodeData, directiveName, directive, attVal)
        removeAtt(domElement, directiveName)
      }
    }
  }

  // Process event attributes, we need to call extractAtts() again.
  const remainingAtts = extractAtts(domElement)
  if (remainingAtts) {
    for (let [key, value] of Object.entries(remainingAtts)) {
      if (key.toLowerCase().startsWith(':on')) {
        let event = key.substr(3)
        let directive = {
          params: 'callbackStr',
          handle: function(callbackStr) {
            this.addEventListener(event, callbackStr)
          }
        }
        processDirective(nodeData, key, directive, value)
        hasData = true
        removeAtt(domElement, key)
      }
    }
  }

  // Check inline calls
  processInlineWatches(nodeData, domElement)
  hasData = hasData || nodeData.watches.length > 0

  return hasData ? nodeData : undefined
}




const extractAttributes = (path, domElement, astAttributes) => {
  
  astAttributes.forEach(attr => {
    const code = readCode(path, attr)
    let [name, ...rest] = code.split('=')
    rest = rest.join('=')
    if (name.startsWith('_')) {
      name = ':' + name.slice(1)
      if (rest.startsWith("{")) {
        rest = rest.slice(1, - 1)
    
      } else {
        rest = trimChar(rest, '"')
      }
    }
    domElement.setAttribute(name, rest)
  })
}


const processJSXText = (astNode) => {
  // expressions in text become JSXExpressionContainers, so there is never dynamic 
  // data inside JSText.
  return {
    domElement: doc.createTextNode(astNode.value),
    dynamicNode: undefined
  }
}


const processJSXExpressionContainer = (path, astNode, nodeTreeAddress) => {
  // This will only catch expressions in text, not attributes.
  const domElement = doc.createElement('text')
  domElement.textContent = '.'
  // readCode(path, astNode)
  // processInlineWatches(nodeData, domElement)
  return {
    domElement, dynamicNode: undefined
  }
}


/**
 * A normal attribute may still have directives inside.
 */
const processNormalAttribute = (domElement, path, attr, name) => {
  switch (attr.value.type) {
    case 'StringLiteral':
      domElement.setAttribute(name, attr.value.value)
      break
    case 'JSXExpressionContainer':
      console.log(attr)
      break
    default:
      throw path.buildCodeFrameError(`Unexpected node type: ${attr.type}`)
  }
}

const attValue = (path, attr) => {

}


const processAttributeDirective = (domElement, path, attr, name) => {
  const directiveCallback = directives[name]
  if (!directiveCallback) {
    throw path.buildCodeFrameError(`Unknown directive: ${name}`)  
  }
  const nodeData = new NodeData(domNode, nodeTreeAddress)
  processDirective(nodeData, name, directiveCallback, attValue(path, attr))
}


const processJSXElement = (path, astNode, nodeTreeAddress) => {
  const openingElement = astNode.openingElement
  const tagName = openingElement.name.name
  // TODO: detect special tagname here.
  const domElement = doc.createElement(tagName)
  openingElement.attributes.forEach(attr => {
    
    let name = attr.name.name 

    if (name.startsWith('__')) {
      processNormalAttribute(domElement, path, attr, name.slice(1))
    } else if (name.startsWith('_')) {
      processAttributeDirective(domElement, path, attr, name.slice(1))      
    } else {
      processNormalAttribute(domElement, path, attr, name)
    }
  })
  return {
    domElement, dynamicNode: undefined
  }
}


const extractNodeData = (path, astNode, nodeTreeAddress) => {
  switch (astNode.type) {
    case 'JSXText':
      return processJSXText(astNode)
    case 'JSXExpressionContainer':
      return processJSXExpressionContainer(path, astNode, nodeTreeAddress)
    case 'JSXElement':
      return processJSXElement(path, astNode, nodeTreeAddress)     
    default:
      throw path.buildCodeFrameError(`Unexpected node type: ${astNode.type}`)
  }
}


module.exports = {extractNodeData}