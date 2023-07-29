const t = require('@babel/types')
const {handleHtml, handleStubs} = require('./handlers')
const {
  getNodeHtmlString, 
  getNodeHtmlObjectOfStrings, 
  insertStatementsAfter, 
  removeWallaceDefs
} = require('./utils/babel')


module.exports = () => {
  return {
    visitor: {
      MemberExpression(path) {
        // TODO, maybe move this into the CallExpression or at least do the same checks.
        if (path.node.property.name === '__ex__') {
          const baseClass = path.node.object.name
          path.replaceWithSourceString(`${baseClass}.prototype.__ex`)
        }
      },
      CallExpression(path) {
        const callee = path.node.callee
        if (
          callee &&
          callee.type === 'MemberExpression' && 
          callee.property.name === '__ex__' &&
          path.parent &&
          path.parent.type === 'VariableDeclarator'
          ) {
                  
          const baseClass = callee.object.name
          const componentName = path.parent.id.name
          const nodeToInsertAfter = path.parentPath.parentPath
          const data = parseExArguments(path)

          if (data.html) {
            let statements = handleHtml(componentName, getNodeHtmlString(data.html), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }

          if (data.stubs) {
            let statements = handleStubs(componentName, getNodeHtmlObjectOfStrings(data.stubs), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }
          
          const newArgs = [t.identifier(baseClass)]
          
          // If either is supplied, we must still include both arguments to the call.
          let protoArg, constructorArg
          if (data.hasOwnProperty('prototype')) {
            protoArg = data.prototype
          }
          if (data.hasOwnProperty('constructor')) {
            constructorArg = data.constructor
          }
          if (protoArg || constructorArg) {
            newArgs.push(protoArg || t.identifier('undefined'))
            newArgs.push(constructorArg)
          }
          path.node.arguments = newArgs
        }
      },
      Class(path, state) {
        if (path.type === 'ClassDeclaration') {

          // TODO: tidy up how args are passed, and whether we bother with componentData...
          let html, stubs, componentName = path.node.id.name

          // Iterate over class nodes to find ones we care about
          for (let node of path.node.body.body) {
            let propName = node.key.name
            if (propName === '__html__' || propName === '__clone__') {
              html = getNodeHtmlString(node.value)
            } else if (propName === '__stubs__') {
              stubs = getNodeHtmlObjectOfStrings(node.value)
            }
          }
          removeWallaceDefs(path)
          if (stubs) {
            insertStatementsAfter(path, handleStubs(componentName, stubs, path))
          }
          if (html) {
            insertStatementsAfter(path, handleHtml(componentName, html, path))
          }
        }
      },
      JSXElement(path) {
        //get the opening element from jsxElement node
        var openingElement = path.node.openingElement;  
        //tagname is name of tag like div, p etc
        var tagName = openingElement.name.name;

        // console.log('JSXElement', tagName)
        console.log('JSXElement', path.node)
        // t.stringLiteral()

        path.replaceWithSourceString("'foo'")
        
        // // arguments for React.createElement function
        // var args = []; 
        // //adds "div" or any tag as a string as one of the argument
        // args.push(t.stringLiteral(tagName)); 
        // // as we are considering props as null for now
        // var attribs = t.nullLiteral(); 
        // //push props or other attributes which is null for now
        // args.push(attribs); 
        // // order in AST Top to bottom -> (CallExpression => MemberExpression => Identifiers)
        // // below are the steps to create a callExpression
        // var reactIdentifier = t.identifier("React"); //object
        // var createElementIdentifier = t.identifier("createElement"); //property of object
        // var callee = t.memberExpression(reactIdentifier, createElementIdentifier)
        // var callExpression = t.callExpression(callee, args);
        //  //now add children as a third argument
        // callExpression.arguments = callExpression.arguments.concat(path.node.children);
        // // replace jsxElement node with the call expression node made above
        // path.replaceWith(callExpression, path.node);
        

      }
    }
  }
}


const allowedHtmlTypes = [
  'TaggedTemplateExpression',
  'TemplateLiteral',
  'StringLiteral',
  'JSXElement'
]
const eitherAllowedTypes = [...allowedHtmlTypes, 'ObjectExpression']

const assertType = (path, thing, types, description) => {
  if (!types.includes(thing.type)) {
    throw path.buildCodeFrameError(`${description} must be of type ${types} but is a ${thing.type}.`)
  }
  return thing
}

const parseExArguments = (path) => {
  const args = path.node.arguments
  const data = {}

  if (args.length == 1) {
    // Must be html or an ObjectExpression - not an identifier
    const argument = assertType(path, args[0], eitherAllowedTypes, 'Argument to __ex__()')
    if (argument.type == 'ObjectExpression') {
      argument.properties.forEach(element => {
        data[element.key.name] = element.value
      })
    } else {
      data['html'] = assertType(path, args[0], allowedHtmlTypes, 'Argument to __ex__()')
    }
  } else if (args.length == 2) {
    // Must be __ex__(html, methods) where methods can be an object literal or an identifier.

    data['html'] = assertType(path, args[0], allowedHtmlTypes, 'First Argument to __ex__()')
    data['prototype'] = assertType(path, args[1], ['ObjectExpression', 'Identifier'], 'Second Argument to __ex__()')
  } else {
    throw path.buildCodeFrameError(`__ex__() takes either one or two arguments, Received ${args.length}.`)
  }
  return data
} 
