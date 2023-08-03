const {CodeGenerator} = require('./generate/code_generator')
const {extractNodeData} = require('./parse/parse_node')
const {JSDOM} = require( 'jsdom')
const {stripHtml, preprocessHTML} = require('./utils/dom')
const {escapeSingleQuotes} = require('./utils/misc')
const t = require('@babel/types')


const dom = new JSDOM('<!DOCTYPE html>')
const doc = dom.window.document

// let text = doc.createTextNode('here is some text');
// let div = doc.createElement('div');


const squashChildren = (astNode) => {
  const children = []
  const sequence = []
  const flush = () => {
    const textNode = t.JSXText(sequence.join(''))
    // textNode.value = 
    children.push(textNode)
    // children.push(t.JSXText(t.stringLiteral(sequence.join(''))))
    sequence.length = 0
  }
  // console.log(astNode.children)
  astNode.children.forEach(child => {
    switch (child.type) {
      case 'JSXText':
        sequence.push(child.value)
        break
      case 'JSXExpressionContainer':
        sequence.push(child.value)
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

/**
 * 
 * 
 */
const extractDomElement = (astNode) => {
  let domElement, childNodes = []

  switch (astNode.type) {
    case 'JSXText':
      domElement = doc.createTextNode(astNode.value)
      break
    case 'JSXExpressionContainer':
      domElement = doc.createTextNode(astNode.toString())
      break
    case 'JSXElement':
      const tagName = astNode.openingElement.name.name
      domElement = doc.createElement(tagName)
      childNodes = squashChildren(astNode)
      break
    default:
      console.log(222, astNode)
      throw new Error('Unexpected node type: ' + astNode.type)
  }
  return [domElement, childNodes]
}

/**
 * Attach a new element to the DOM at the specified path.
 */
const attachElement = (root, nodeTreeAddress, element) => {
  // TODO: figure this out... 
  path = nodeTreeAddress.slice(0, -1)
  const attach = path.reduce((acc, index) => acc.childNodes[index], root)
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
    this.path = path
    // console.log(this.path.node.openingElement.attributes)
    this.processAsStub = false
  }
  process() {
    // The address of the current node processed e.g. [1, 3, 0]
    const nodeTreeAddress = []
    let rootElement // this.path.node //  = doc.createElement('div')
    const generator = new CodeGenerator(this.componentName, this.processAsStub)
    
    // Called recursively to process each node in JSX.
    // Note that there could be other syntax in here like for loops - but would they 
    // be expressions?
    const walkJSX = (astNode, i) => {


      const [domElement, childNodes] = extractDomElement(astNode)
      // console.log(domElement, childNodes?.map(node => node.type))
      // This is a temporary measure allowing us to reuse the functionality for HTML strings.
      const nodeData = extractNodeData(domElement, this.processAsStub)

      // TODO: change the above to instantiate the nodeData object here?
      // Then check if nodeData.hasDirectives
      // Maybe also make it specify the children to walk
      // Maybe differentiate node types here.

      if (i !== undefined) {
        nodeTreeAddress.push(i)
      }
      if (rootElement) {
        // TODO append as per proto.__fe using nodeTreeAddress
        attachElement(rootElement, nodeTreeAddress, domElement)
      } else {
        rootElement = domElement
      }
      if (nodeData) {
        generator.processNodeWithDirectives(nodeData, nodeTreeAddress)
      }

      childNodes.forEach(walkJSX)
      nodeTreeAddress.pop()
    }

    walkJSX(this.path.node)

    // TODO: strip whitespace, and handle \n better?
    const html = escapeSingleQuotes(stripHtml(preprocessHTML(rootElement.outerHTML)))
    console.log(html)
    // generator.rootElement = rootElement
    this.applyTransformations()
  }

  _traverseJSX() {
    // Must start at parent as it was already visited.
    // this.path.parentPath.traverse(this.getVisitor())

    // const walk = (node) => {
    //   console.log(node.type)
    //   if (node.children) {
    //     node.children.forEach(walk)
    //   }
    // }

    // walk(this.path.node)

    
  }
  getVisitor() {
    return {
      JSXElement: (path) => this.JSXElement(path),
      JSXText: (path) => this.JSXText(path),
      JSXExpressionContainer: (path) => this.JSXExpressionContainer(path),
    }
  }
  applyTransformations() {
    throw {message: 'Not implemented'}
  }
  JSXElement(path) {
    console.log(this.name)
    var openingElement = path.node.openingElement
    var tagName = openingElement.name.name
    console.log('--JSXElement', tagName)
    // console.log('children', path.node.children)
    console.log('children', path.toString())
  }
  JSXExpressionContainer(path) {
    console.log('--JSXExpressionContainer', path.toString())
  }
  JSXText(path) {
    console.log('--JSXText', path.node.value)
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
    this.baseClassName = path.parent.id.name
    this.nodeToInsertAfter = path.parentPath.parentPath
  }
  applyTransformations() {
    // TODO: change __ex to not require arg?
    // Also chek import.
    // insertStatementsAfter(this.nodeToInsertAfter, ["a = 1", "b = 2"])
    this.path.replaceWithSourceString(`Component.prototype.__ex(Component)`)
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
  applyTransformations() {
    // Removes the property and value.
    this.path.parentPath.remove()
    this.path.remove()
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
