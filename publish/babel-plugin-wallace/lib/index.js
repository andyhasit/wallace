const {jsxContextClasses} = require('./jsx/contexts')

const needsImport = []

const importWallaceComponent = (t) => {
  const specifier = t.ImportSpecifier(t.Identifier("Component"), t.Identifier("Component"))
  return t.ImportDeclaration([specifier], t.stringLiteral('wallace'))
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
          // TODO: if (config.strict)...
          throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
        }
        if (contextMatches.length > 1) {
          const contextNames = contextMatches.map(cls => cls.name)
          throw path.buildCodeFrameError(`JSX matches multiple contexts (${contextNames}). Please report this to wallace!`)
        }

        const program = path.findParent((path) => path.type == 'Program')
        needsImport.push(program.hub.file.opts.filename)
      }
    }
  }
}
