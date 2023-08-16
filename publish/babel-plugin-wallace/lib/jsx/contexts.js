/**
 * Classes for processing JSX in allowed contexts. 
 * Each context is handled by a different subclass.
 * Each class is responsible for modifying the surrounding code.
 */
const { convertJSX } = require('../convert.js')
const { insertStatementsAfter } = require('../utils/babel')


class BaseJSXContextHandler {
  constructor(path) {
    this.path = path
  }
  matches() {
    // TODO create internal wallace error.
    throw new Error('Not implemented')
  }
  handle() {
    throw new Error('Not implemented')
  }
}


/**
 * Handles JSX as direct assignment:
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
    const statements = convertJSX(this.path, componentName)
    this.path.replaceWithSourceString(`Component.define({})`)
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}


/**
 * Handles JSXElement in call to Component.define:
 * 
 *   const MyComponent = define(JSXElement)
 *   const MyComponent = define({...}, JSXElement)
 * 
 */ 
class JSXInComponentDefineCallArg extends BaseJSXContextHandler {
  matches() {
    const parent = this.path.parent
    if (
      parent?.type == 'CallExpression' &&
      parent.callee?.type == 'MemberExpression' &&
      parent.callee?.object?.name == 'Component' &&
      parent.callee?.property?.name == 'define'
    ) {
      return true
    }
    return false
  }
  handle() {
    const JSXElementPath = this.path
    const CallExpressionPath = JSXElementPath.parentPath
    const VariableDeclaratorPath = CallExpressionPath.parentPath
    const nodeToInsertAfter = VariableDeclaratorPath.parentPath
    const componentName = VariableDeclaratorPath.node.id.name

    // TODO: change to define({}, internalOpts)
    const statements = convertJSX(this.path, componentName)
    if (CallExpressionPath.node.arguments.length == 1) {
      JSXElementPath.replaceWithSourceString('{}')
    } else {
      JSXElementPath.remove()
    }
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}


/**
 * Handles JSX in a class definition:
 * 
 *   class Foo extends Component {
 *     html = <div>...</div>
 *   }
 */ 
class JSXInClassDefinition extends BaseJSXContextHandler {
  matches() {
    const parent = this.path.parent
    return (
      parent?.type == 'CallExpression' &&
      parent.callee?.type == "Identifier" &&
      parent.callee.name == "_defineProperty" &&
      parent.arguments[1]?.value == "html"
    )
  }
  handle() {
    const JSXElementPath = this.path
    const CallExpressionPath = JSXElementPath.parentPath
    const ExpressionStatement = CallExpressionPath.parentPath
    const BlockStatement = ExpressionStatement.parentPath
    const FunctionDeclaration = BlockStatement.parentPath
    const componentName = FunctionDeclaration.node.id.name
    const nodeToInsertAfter = FunctionDeclaration.parentPath.parentPath.parentPath.parentPath.parentPath
    // console.log(ExpressionStatement.node)
    ExpressionStatement.remove()
    const statements = convertJSX(this.path, componentName)
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}


module.exports = {
  jsxContextClasses: [
    JSXInDirectAssignment,
    JSXInComponentDefineCallArg,
    JSXInClassDefinition,
  ]
}
