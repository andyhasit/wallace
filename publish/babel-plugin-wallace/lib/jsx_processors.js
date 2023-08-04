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

    const [domElement, childAstNodes] = this._parseJSXElement(astNode)
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
  /**
   * Parses a JSX element returning a [domElement, childAstNodes] because we currently
   * squash sequential text-like children into one JSXtext:
   * 
   *   [JSXText('hi '), JSXExpression({name}), JSXText('!')] > JSXText('hi {name}!')
   * 
   * And parse the text in there.
   * 
   * We will change this to eventually inspect the JSXExpression properly.
   */
  _parseJSXElement(astNode) {
    let domElement, childAstNodes = []
  
    switch (astNode.type) {
      case 'JSXText':
        domElement = doc.createTextNode(astNode.value)
        break
      case 'JSXExpressionContainer':
        domElement = doc.createTextNode(astNode.toString())
        break
      case 'JSXElement':
        const openingElement = astNode.openingElement
        const tagName = openingElement.name.name
        const attributes = openingElement.attributes
        console.log(attributes)
        domElement = doc.createElement(tagName)
        
        // TODO: change to proper way later
        attributes.forEach(attr => {
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
        childAstNodes = this._squashChildren(astNode)
        break
      default:
        console.log(astNode)
        throw new Error('Unexpected node type: ' + astNode.type)
    }
    return [domElement, childAstNodes]
  }
  /**
   * squash sequential text-like children into one JSXtext:
   * 
   *   [JSXText('hi '), JSXExpression({name}), JSXText('!')] > JSXText('hi {name}!')
   */
  _squashChildren(astNode) {
    const children = []
    const sequence = []

    const flush = () => {
      const text = sequence.filter(s => s.trim().length).join('')
      // const sanitised = sequence.join('').replace(/(?:\r\n|\r|\n)/g, ' ')
      if (text.length) {
        const textNode = JSXText(text)
        children.push(textNode)
      }
      sequence.length = 0
    }
    
    astNode.children.forEach(child => {
      switch (child.type) {
        case 'JSXText':
          const text = child.value
          if (text) {
            sequence.push(text)
          }
          break
        case 'JSXExpressionContainer':
          const rawCode = this._path.hub.file.code.substring(child.start, child.end)
          sequence.push(rawCode)
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
