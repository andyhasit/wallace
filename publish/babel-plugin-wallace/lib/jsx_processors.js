const {CodeGenerator} = require('./generate/code_generator')
const {extractNodeData} = require('./parse/parse_node')
const {JSDOM} = require( 'jsdom')
const {insertStatementsAfter} = require('./utils/babel')
const {stripHtml, preprocessHTML} = require('./utils/dom')
const {escapeSingleQuotes, trimChar} = require('./utils/misc')
const {JSXText} = require('@babel/types')


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
};


/**
 * Base class for processing JSX in a certain context.
 * Each context is handled by a different subclass.
 * This involves parsing the JSX code, modifying the surrounding code and adding new 
 * lines of code.
 */
class AbstractJSXProcessor {
  constructor(path) {
    this._path = path
    this._nodeToInsertAfter = this._path.parentPath.parentPath
    // The address of the current node processed e.g. [1, 3, 0]
    this._nodeTreeAddress = []
    this._rootElement = undefined
    this._componentName = path.parent.id.name
    this._processAsStub = false
    this._generator = new CodeGenerator(this._componentName, this._processAsStub)
  }
  process() {
    this._walkJSXTree(this._path.node, undefined)
    this._generator.rawHTML = this._getHtmlString()
    insertStatementsAfter(this._nodeToInsertAfter, this._generator.buildStatements())
    this._applyTransformations()
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


/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = <div>...</div>
 */ 
class JSXInDirectAssignment extends AbstractJSXProcessor {
  constructor(path) {
    super(path)
    this._baseClassName = path.parent.id.name
    this._nodeToInsertAfter = path.parentPath.parentPath
  }
  _applyTransformations() {
    // TODO: change __ex to not require arg?
    // Also check that Component is imported.
    // insertStatementsAfter(this._nodeToInsertAfter, ["a = 1", "b = 2"])
    this._path.replaceWithSourceString(`Component.prototype.__ex(Component)`)
  }
}

/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = {
 *     html: <div>...</div>
 *   }
 */ 
class JSXInObjectHtml extends AbstractJSXProcessor {
  _applyTransformations() {
    // Removes the property and value.
    this._path.parentPath.remove()
    this._path.remove()
  }
}

/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = {
 *     stubs: {
 *       footer: <div>...</div>
 *     }
 *   }
 */ 
class JSXInObjectStub extends AbstractJSXProcessor {
}


/**
 * Handles JSX in the following context:
 * 
 *   class Foo extends Component {
 *     html = <div>...</div>
 *   }
 */ 
class JSXInClassHtml extends AbstractJSXProcessor {
}


/**
 * Handles JSX in the following context:
 * 
 *   class Foo extends Component {
 *     stubs = {
 *       footer: <div>...</div>
 *     }
 *   }
 */ 
class JSXInClassStub extends AbstractJSXProcessor {
}

/**
 * Returns the correct JSX processor for the given path. Maybe each should specify its
 * matching context.
 */ 
const getJSXprocessor = (path) => {

  switch(path.parent?.type) {
    case "VariableDeclarator":
      return new JSXInDirectAssignment(path)
    case "ObjectProperty":
      console.log(path.parent.key.name)
      if (path.parent.key.name === "html") {
        return new JSXInObjectHtml(path)
      }
      // TODO: could be stubs, could be in a class.
    case "CallExpression":
        // code block

        // It's a class property if:
        // callee: { type: 'Identifier', name: '_defineProperty' }
        console.log(path.parent.path)
  }
  console.log(path.parent?.type)
  throw path.buildCodeFrameError("JSX used outside of a valid context.")
}

module.exports = {getJSXprocessor}
