const {CodeGenerator} = require('./generate/code_generator')
const {extractNodeData} = require('./parse/parse_node')
const { JSXText } = require('@babel/types')
const {JSDOM} = require( 'jsdom')
const {stripHtml, preprocessHTML} = require('./utils/dom')
const {escapeSingleQuotes, trimChar} = require('./utils/misc')




const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document


/**
 * Attach a new element to the DOM at the specified path.
 */
const attachElement = (root, nodeTreeAddress, element) => {
  // TODO: figure this out... 
  const relativePath = nodeTreeAddress.slice(0, -1)
  const attach = relativePath.reduce((acc, index) => acc.childNodes[index], root)
  attach.appendChild(element)
}
 

/**
 * This involves parsing the JSX code, modifying the surrounding code and adding new 
 * lines of code.
 */
class JSXParser {
    constructor(path, componentName, processAsStub) {
      this._path = path
      this._componentName  = componentName
      this._processAsStub  = processAsStub
    }
    collectStatements() {
  
      // The address of the current node processed e.g. [1, 3, 0]
      this._nodeTreeAddress = []
      this._rootElement = undefined
      this._processAsStub = false
      this._generator = new CodeGenerator(this._componentName, this._processAsStub)
  
      this._walkJSXTree(this._path.node, undefined)
      this._generator.rawHTML = this._getHtmlString()
      return this._generator.buildStatements()
    }
    _getHtmlString() {
      return escapeSingleQuotes(stripHtml(preprocessHTML(this._rootElement.outerHTML)))
    }
    _walkJSXTree(astNode, i) {
      if (i !== undefined) {
        this._nodeTreeAddress.push(i)
      }
      const domElement = this._convertToDomElement(astNode)
      const childAstNodes = this._squashChildren(astNode)
      // const [domElement, childAstNodes] = this._parseJSXElement(astNode)
      // console.log(domElement, this._nodeTreeAddress, childAstNodes.length)
      if (this._rootElement) {
        attachElement(this._rootElement, this._nodeTreeAddress, domElement)
      } else {
        this._rootElement = domElement
      }
  
      // This is a temporary measure allowing us to reuse the functionality for HTML strings.
      const nodeData = extractNodeData(domElement, this._processAsStub)
      if (nodeData) {
        this._generator.processNodeWithDirectives(nodeData, this._nodeTreeAddress)
      }
  
      childAstNodes.forEach((node, i) => this._walkJSXTree(node, i))
      this._nodeTreeAddress.pop()
    }
    _convertToDomElement(astNode) {
      switch (astNode.type) {
        case 'JSXText':
          return doc.createTextNode(astNode.value)
        case 'JSXExpressionContainer':
          const te = doc.createElement('text')
          te.textContent = this._readCode(astNode)
          return te
        case 'JSXElement':
          const openingElement = astNode.openingElement
          const tagName = openingElement.name.name
          const attributes = openingElement.attributes
          const domElement = doc.createElement(tagName)
          
          // TODO: change to proper way later
          this._extractAttributes(domElement, attributes)
          return domElement
        default:
          console.log(astNode)
          throw new Error('Unexpected node type: ' + astNode.type)
      }
    }
    _extractAttributes(domElement, astAttributes) {
      astAttributes.forEach(attr => {
        const code = this._path.hub.file.code.substring(attr.start, attr.end)
        let [name, ...rest] = code.split('=')
        rest = rest.join('=')
        if (name.startsWith('_')) {
          name = ':' + name.slice(1)
          if (rest.startsWith("{")) {
            rest = rest.slice(1, - 1)
          }
        } else {
          rest = trimChar(rest, '"')
        }
        domElement.setAttribute(name, rest)
      })
    }
    /**
     * Removes blank JSText nodes.
     * 
     */
    _squashChildren(astNode) {
      if (astNode.type != 'JSXElement') {
        return []
      }
      const children = []
      const sequence = []
  
      const flush = () => {
        if (sequence.length === 1) {
          const node = sequence[0]
          if (node.type == 'JSXExpressionContainer') {
            const text = this._readCode(node)
            children.push(JSXText(text))
          } else {
            children.push(node)
          }
        } else {
          children.push(...sequence)
        }
        sequence.length = 0
      }
  
      // TODO: if we have a JSXExpressionContainer on its own, convert it to a JSXText.
      astNode.children.forEach(child => {
        switch (child.type) {
          case 'JSXText':
            if (child.value.trim()?.length) {
              sequence.push(child)
            }
            break
          case 'JSXExpressionContainer':
            sequence.push(child)
            break
          case 'JSXElement':
            flush()
            children.push(child)
            break
          default:
            console.log(astNode)
            throw new Error('Unexpected node type: ' + child.type)
        }
      })
      flush()
      return children
    }
    _readCode(astNode) {
      return this._path.hub.file.code.substring(astNode.start, astNode.end)
    }
  
  }

  module.exports = {JSXParser}