/**
 * 
 * "Container is falsy" usually means you're trying to do an operation on a node that was deleted.
 */

const {jsxContextClasses} = require('./jsx_contexts')
const {allValuesAreJSX, removeNode} = require('./utils/babel')
const template = require('@babel/template').default
const imports = []

const needsImport = []


const importWallaceComponent = (t) => {
  const specifiers = [
    t.ImportSpecifier(t.Identifier("Component"), t.Identifier("Component"))
  ]
  return t.ImportDeclaration(specifiers, t.stringLiteral('wallace'))
  // return template("import {Component} from 'wallace'")()
}

module.exports = ({ types: t }) => {
  return {
    visitor: {
      Program: {
        exit(path) {
          const filename = path.hub.file.opts.filename
          if (needsImport.includes(filename)) {
            // TODO: check if already imported
            path.unshiftContainer('body', importWallaceComponent(t))
          }
        }
      },
      ImportDeclaration(path) {
        // Maybe use this to identify files with Component import so it's not imported twice?
      },
      JSXElement(path) {
        // We use the root JSX element as entry point, regardless of where it is found.
        // The context handler will delete this node, and potentially code above it, so
        // be careful adding more visitors.
        // This also means this only ever catches the root JSXElement.
        const contextMatches = jsxContextClasses.map(cls => new cls(path)).filter(context => context.matches())
        if (contextMatches.length  == 1) {
          contextMatches[0].handle()
        }
        if (contextMatches.length === 0) {
          // if (config.strict)...
          // console.log(path.parent)
          throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
        }
        if (contextMatches.length > 1) {
          const contextNames = contextMatches.map(cls => cls.name)
          throw path.buildCodeFrameError(`JSX matches multiple contexts (${contextNames}). Please report this to wallace!`)
        }

        const program = path.findParent((path) => path.type == 'Program')
        needsImport.push(program.hub.file.opts.filename)
      },
      ObjectExpression: {
        exit(path) {
          if (allValuesAreJSX(path.node)) {
            // This means it is a stub, and all its JSX will have been handled already as
            // th
            path.remove()
          }
        }
      }
    },
  }
}
