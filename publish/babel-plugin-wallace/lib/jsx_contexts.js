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
    // TODO: add an import to define.
    const nodeToInsertAfter = this.path.parentPath.parentPath
    const componentName = this.path.parentPath.node.id.name
    const parser = new JSXParser(this.path, componentName, false)
    const statements = parser.collectStatements()
    this.path.replaceWithSourceString(`Component.define({})`)
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}



/**
 * Handles JSXElement in the following context:
 * 
 *   const MyComponent = define(JSXElement)
 *   const MyComponent = define({...}, JSXElement)
 * 
 */ 
class JSXInComponentDefineCallArg extends BaseJSXContextHandler {
  matches() {
    const parent = this.path.parent
    if (
      parent.type == 'CallExpression' &&
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
    const parser = new JSXParser(JSXElementPath, componentName, false)

    // TODO: change to define({}, internalOpts)
    const statements = parser.collectStatements()
    if (CallExpressionPath.node.arguments.length == 1) {
      JSXElementPath.replaceWithSourceString('{}')
    } else {
      JSXElementPath.remove()
    }
    insertStatementsAfter(nodeToInsertAfter, statements)
  }
}


/**
 * Handles JSX in the following context:
 * 
 *   const MyComponent = define({
 *     header: <div>...</div>,
 *     footer: <div>...</div>,
 *   })
 * 
 * Note: the whole object must consist of stubs.
 */ 
class JSXInDefineCallObject extends BaseJSXContextHandler {
  matches() {
    return (
      false
      // this.path.parent?.type === 'ObjectProperty' 
      // && 
      // for class just add  
      // this.path.parent.key.name == '_stubs' &&
      // isComponentDefineCall(this.path.parentPath?.parentPath?.parentPath)
    )
  }
  handle() {
    const JSXElementPath = this.path
    const ObjectPropertyPath = JSXElementPath.parentPath
    const ObjectExpressionPath = ObjectPropertyPath.parentPath
    const CallExpressionPath = ObjectExpressionPath.parentPath
    const VariableDeclaratorPath = CallExpressionPath.parentPath

    const nodeToInsertAfter = VariableDeclaratorPath.parentPath
    const componentName = VariableDeclaratorPath.node.id.name

    const parser = new JSXParser(JSXElementPath, componentName, true)
    const statements = parser.collectStatements()
    insertStatementsAfter(nodeToInsertAfter, statements)

    // console.log(222, this.path.node)
    // ObjectExpressionPath.node.properties.forEach(element => {
    //   // htmlStrings[element.key.name] = getNodeHtmlString(element.value)
    //   console.log(element.key.name) //] = getNodeHtmlString(element.value)
    //   console.log(element.value.node)
    //   // console.log(element.value.parentPath)

    //   const parser = new JSXParser(JSXElementPath, componentName, true)
    //   const statements = parser.collectStatements()
    //   insertStatementsAfter(nodeToInsertAfter, statements)
    // })
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    
    TODO: reconsider the whole thing as we're going up the tree, deleting the object,
    but the traversal still goes to next key.

    TODO: but we can't parse properties correctly.

    Maybe we generate the code from here, and have an ObjectExpression exit visitor 
    which deletes it.
    Try that first.

    copy from handleStubs() which should generate this:

    var _sv = CustomModal.prototype.__sv();
    CustomModal.prototype.__stubs__inner = _sv;
    var _sv_prototype = _sv.prototype;
    _sv_prototype.__ht = '<ul></ul>';
    _sv_prototype.__wc = [_sv_prototype.__wa('_1', 0, 0, 0, {
      'c.parent.items()': function cParentItems(n, o, w, p, c) {
        w.items(n, c);
      }
    })];
    _sv_prototype.__qc = _sv_prototype.__lu({
      'c.parent.items()': function cParentItems(c, p) {
        return c.parent.items();
      }
    });
    _sv_prototype.__ip = {};
    _sv_prototype.__bv = function (component, prototype) {
      component.__bd(prototype);
      component.el = {
        '_1': component.__gw([]).pool(component.pool(Item))
      };
    };
    _sv_prototype.__cn = undefined;


    It seems like a stub is just another component, but built to convert c and p to
    c.parent and c.parent.p
    */

    // removeNode(CallExpressionPath, ObjectExpressionPath)
    // ObjectPropertyPath.remove()
    // JSXElementPath.remove()
    // ObjectExpressionPath.replaceWithSourceString('2')
    // ObjectExpressionPath.remove()
    // console.log(componentName)

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
// class JSXInObjectStub extends BaseJSXContextHandler {
//   matches() {
//     if (this.path.parent?.parent?.type === 'ObjectProperty') {
//       const propertyName = this.path.parent.parent.key.name
//       return propertyName == 'stubs'
//     }
//   }
//   handle() {
//     console.log('JSXInObjectStub')
//   }
// }


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
// const getJSXContextHandler = (path) => {

//   switch(path.parent?.type) {
//     case "VariableDeclarator":
//       return new JSXInDirectAssignment(path)
//     case "ObjectProperty":
//       const propertyName = path.parent.key.name
//       if (JSX_KEYS.includes(propertyName)) {
//         return new JSXInObjectHtml(path)
//       }
//       // TODO: could be stubs, could be in a class.
//     case "CallExpression":
//       // code block

//       // It's a class property if:
//       // callee: { type: 'Identifier', name: '_defineProperty' }
//       console.log(path.parent.path)
//   }
//   throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
// }


module.exports = {
  jsxContextClasses: [
    JSXInDirectAssignment,
    JSXInComponentDefineCallArg,
    JSXInDefineCallObject,
    // JSXInObjectHtml,
    // JSXInObjectStub,
    // JSXInClassHtml,
    // JSXInClassStub,
  ]
}
