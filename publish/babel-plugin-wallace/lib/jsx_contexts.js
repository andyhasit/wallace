const { JSXParser } = require('./jsx_parser.js')
const { insertStatementsAfter } = require('./utils/babel')



const JSX_KEYS = ['html', 'stubs']

/*

TODO:
  BaseJSXContext just has helper methods. They are responsible for:
    - Determining the component name
    - Determining where to insert the code
    - Finding all the JSX for the component
    - Removing and replacing elements
    - calling parser/generator 

*/





/**
 * Base class for processing JSX in a certain context.
 * Each context is handled by a different subclass.
 */
class BaseJSXContextHandler {
  constructor(path) {
    this.path = path
  }
  matches() {
    // TODO create internal wallace error.
    throw {message: 'Not implemented'}
  }
  handle() {
    throw {message: 'Not implemented'}
  }
}



/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = <div>...</div>
 */ 
class JSXInDirectAssignment extends BaseJSXContextHandler {
  matches() {
    return this.path.parent?.type === 'VariableDeclarator'
  }
  handle() {
    const nodeToInsertAfter = this.path.parentPath.parentPath
    const componentName = this.path.parentPath.node.id.name
    const parser = new JSXParser(this.path, componentName, false)
    const statements = parser.collectStatements()
    this.path.replaceWithSourceString(`Component.prototype.__ex(Component)`)
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}

/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = {
 *     html: <div>...</div>
 *   }
 */ 
class JSXInObjectHtml extends BaseJSXContextHandler {
  matches() {
    // TODO: also check it is part of variable assignment
    if (this.path.parent?.type === 'ObjectProperty') {
      const propertyName = this.path.parent.key.name
      return propertyName == 'html'
    }
  }
  handle() {
    const JSXElementPath = this.path
    const ObjectPropertyPath = JSXElementPath.parentPath
    const ObjectExpressionPath = ObjectPropertyPath.parentPath
    const VariableDeclaratorPath = ObjectExpressionPath.parentPath
    const nodeToInsertAfter = VariableDeclaratorPath.parentPath
    const componentName = VariableDeclaratorPath.node.id.name
    const parser = new JSXParser(this.path, componentName, false)
    const statements = parser.collectStatements()
    ObjectExpressionPath.replaceWithSourceString(`Component.prototype.__ex(Component)`)
    insertStatementsAfter(nodeToInsertAfter, statements)
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
class JSXInObjectStub extends BaseJSXContextHandler {
  matches() {
    if (this.path.parent?.parent?.type === 'ObjectProperty') {
      const propertyName = this.path.parent.parent.key.name
      return propertyName == 'stubs'
    }
  }
  handle() {
    console.log('JSXInObjectStub')
  }
}


/**
 * Handles JSX in the following context:
 * 
 *   class Foo extends Component {
 *     html = <div>...</div>
 *   }
 */ 
class JSXInClassHtml extends BaseJSXContextHandler {
  matches() {
    return false
  }
  handle() {
    console.log('JSXInClassHtml')
  }
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
class JSXInClassStub extends BaseJSXContextHandler {
  matches() {
    return false
  }
  handle() {
    console.log('JSXInClassHtml')
  }
}


/**
 * Returns the correct JSX processor for the given path. Maybe each should specify its
 * matching context.
 */ 
const getJSXContextHandler = (path) => {

  switch(path.parent?.type) {
    case "VariableDeclarator":
      return new JSXInDirectAssignment(path)
    case "ObjectProperty":
      const propertyName = path.parent.key.name
      if (JSX_KEYS.includes(propertyName)) {
        return new JSXInObjectHtml(path)
      }
      // TODO: could be stubs, could be in a class.
    case "CallExpression":
      // code block

      // It's a class property if:
      // callee: { type: 'Identifier', name: '_defineProperty' }
      console.log(path.parent.path)
  }
  throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
}


module.exports = {
  jsxContextClasses: [
    JSXInDirectAssignment,
    JSXInObjectHtml,
    JSXInObjectStub,
    JSXInClassHtml,
    JSXInClassStub,
  ]
}
