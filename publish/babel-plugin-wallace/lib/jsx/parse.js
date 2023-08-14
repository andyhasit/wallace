const { JSXText } = require('@babel/types')
const {readCode} = require('../utils/babel')
const {extractNodeData} = require('./extract')
const {ComponentDOM} = require('./component_dom')


/**
 * This parses the JSX code, collecting dynamicNodes.
 */
class JSXParser {
  constructor(path, componentName) {
    this._path = path
    this._componentName = componentName
    this._dom = new ComponentDOM()
    this._nodes = []
    this.dynamicNodes = []
    this.html = undefined
  }
  parse() {
    this._walkJSXTree(this._path.node, undefined)
    this.dynamicNodes = this._nodes.filter(node => node.isDynamic())
    this.html = this._dom.getHtmlString()
  }
  _walkJSXTree(astNode, i, parentNodeData) {
    this._dom.push(i)
    const {element, nodeData} = extractNodeData(
      this._componentName, 
      this._path,
      astNode,
      parentNodeData,
      this._dom.getCurrentAddress()
    )
    this._dom.attach(element)
    this._nodes.push(nodeData)
    const childAstNodes = this._squashChildren(astNode)
    childAstNodes.forEach((node, i) => this._walkJSXTree(node, i, nodeData))
    this._dom.pop()
  }
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
          const text = readCode(this._path, node)
          children.push(JSXText(text))
        } else {
          children.push(node)
        }
      } else {
        children.push(...sequence)
      }
      sequence.length = 0
    }

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
          // console.log(astNode)
          throw new Error('Unexpected node type: ' + child.type)
      }
    })
    flush()
    return children
  }  
}


const parseJSX = (path, componentName) => {
  const parser = new JSXParser(path, componentName)
  parser.parse()
  return {
    componentName: componentName,
    html: parser.html,
    dynamicNodes: parser.dynamicNodes
  }
}

module.exports = {parseJSX}