/**
 * TODO:
 * 
 *  1. Check if I can add an import.
 * 
 *      var _wallace = require("wallace");
 *  
 *  2. Think about only using JSXElement, and passing tree to traverse:
 * 
 *     https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#do-not-traverse-when-manual-lookup-will-do
 * 
 * Check I can replace all path types.
 * Check I can still extend from components if I have no JSX.
 * Rethink what I'm doing with stubs - must they be inherited? Can't I just have stores?
 * 
 * I think I will be able to do most replacements, but not all syntax, and I need a rethink anyway.
 * !! I could also just convert the JSX to string.
 * 
 *  visitor:
 *    (handleHtml, handleStubs) (returns statements)
 *      generateStatements
 *        CodeGenerator > CodeGenerator.buildStatements
 *          DomWalker(this.processNode)
 *    insertAfter()
 * 
 *  New could be:
 *    visitor:JSXElement
 *      JSXHandler (has path)
 *        generateStatements
 *          CodeGenerator
 *      
 * 
 * 
 */

/**
 * Inserts statements after the given path.
 * 
 * @param {*} path 
 * @param {Array} statements - an array of strings
 */
const insertStatementsAfter = (path, statements) => {
  statements.reverse().forEach(statement =>
    path.insertAfter(babel.template.ast(statement))
  )
}


/**
 * Replace the arguments to a CallExpression.
 * 
 * @param {*} path 
 * @param {Array} newArgs - an array of strings
 */
const replaceCallArgs = (path, newArgs) => {
  path.node.arguments = newArgs
}


/**
 * Replace this:
 * 
 *    const Button = Foo.define(
 *
 *  With this:
 * 
 *    const Button = Foo.prototype.define(
 * 
 * @param {*} path 
 * @param {string} baseClassName - an array of strings
 */
const replaceWithPrototypeCall = (path, baseClassName) => {
  path.replaceWithSourceString(`${baseClassName}.prototype.__ex`)
}

/**
 * Checks if call is in format:
 * 
 *    const Foo = Component.define(...)
 * 
 */
const isComponentDefineCall = (parent, callee) => (
  parent?.type === 'VariableDeclarator' &&
  callee?.type === 'MemberExpression' && 
  callee.property.name === 'define'
)



class ComponentDefineCallHandler {
  constructor(path, baseClass, componentName) {
    this.path = path
    this.baseClass = baseClass
    this.componentName = componentName
    this.statements = []
    this.newArgs = [t.identifier(this.baseClass)]
    this.transform()
  }
  transform () {

  }
  getArgs() {

    const newArgs = []
          
    // If either is supplied, we must still include both arguments to the call.
    // let protoArg, constructorArg
    // if (data.hasOwnProperty('prototype')) {
    //   protoArg = data.prototype
    // }
    // if (data.hasOwnProperty('constructor')) {
    //   constructorArg = data.constructor
    // }
    // if (protoArg || constructorArg) {
    //   newArgs.push(protoArg || t.identifier('undefined'))
    //   newArgs.push(constructorArg)
    // }
  }
}





///////////////////


/**
 * Checks if call is in format:
 * 
 *    const Foo = Component.define(...)
 * 
 */
const isComponentDefineCall = (parent, callee) => (
    parent?.type === 'VariableDeclarator' &&
    callee?.type === 'MemberExpression' && 
    callee.property.name === 'define'
  )
  
  
  
  class ComponentDefineCallHandler {
    constructor(path, baseClass, componentName) {
      this.path = path
      this.baseClass = baseClass
      this.componentName = componentName
      this.statements = []
      this.newArgs = [t.identifier(this.baseClass)]
      this.transform()
    }
    transform () {
  
    }
    getArgs() {
  
      const newArgs = []
            
      // If either is supplied, we must still include both arguments to the call.
      // let protoArg, constructorArg
      // if (data.hasOwnProperty('prototype')) {
      //   protoArg = data.prototype
      // }
      // if (data.hasOwnProperty('constructor')) {
      //   constructorArg = data.constructor
      // }
      // if (protoArg || constructorArg) {
      //   newArgs.push(protoArg || t.identifier('undefined'))
      //   newArgs.push(constructorArg)
      // }
    }
  }
  


module.exports = () => {
    return {
      visitor: {
        CallExpression(path) {
          const callee = path.node.callee
          const parent = path.parent
          if (isComponentDefineCall(parent, callee)) {
            const baseClassName = path.node.callee.object.name
            const componentName = path.parent.id.name
            const nodeToInsertAfter = path.parentPath.parentPath
            const handler = new ComponentDefineCallHandler(path, baseClassName, componentName)
            insertStatementsAfter(nodeToInsertAfter, handler.statements)
            replaceCallArgs(path, handler.newArgs)
            console.log(path.parent)
            // path.replaceWithSourceString(`${baseClassName}.prototype.__ex`)
            replaceWithPrototypeCall(path, baseClassName)
          }
        },
        ImportDeclaration: {
          exit(path) {
            // console.log(path.node.source);
          }
        },
        // MemberExpression(path) {
        //   // Replace Component.define with prototype call
        //   // This is dangerous and needs to change as it will catch Any.define(...)
        //   if (path.node.property.name === 'define') {
        //     const baseClassName = path.node.object.name
        //     replaceWithPrototypeCall(path, baseClassName)
        //   }
        // },
        // JSXText(path) {
        //   // getJSXContext(path).handleJSXText(path)
        //   console.log('  JSXText', path.node.value)
        // },
        JSXElement(path) {
          // Because we will replace this AST node, this effectively only handles the 
          // first JSXElement in the declaration.
          const handler = initialiseJSXHandler(path)
          path.traverse(JsxVisitor)        
          handler.applyTransormations()
  
  
          // getJSXContext(path).handleJSXElement(path)
          // JSX should only exist within component or stub declarations.
          var openingElement = path.node.openingElement;  
          var tagName = openingElement.name.name;
          // console.log('  JSXElement', tagName)
          path.traverse(JsxVisitor);
          // console.log('children', path.node.children)
          console.log(path.parent.type) // VariableDeclarator
  
  
           
          // Detect what sort of place 
          
  
          path.replaceWithSourceString("'...'")
        }
      }
    }
  }