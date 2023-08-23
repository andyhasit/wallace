require('./polyfills')
const {config} = require('./config')
const {jsxContextClasses} = require('./jsx/contexts')
const {importChecker} = require('./import-checker')


module.exports = ({ types: t }) => {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          config.configure(state.opts)
        },
        exit(path) {
          importChecker.addMissingImports(path, t)
        }
      },
      ImportDeclaration(path) {
        // Maybe use this to identify files with Component import so it's not imported twice?
        // importChecker.hasComponentImport(path.hub.file.opts.filename)
      },
      /**
       * This node will be removed by handling code, which means:
       *   - We only ever catch the root JSXElement here.
       *   - We need to be mindful if we decide to add more visitors.
       */ 
      JSXElement(path) {
        const contextMatches = jsxContextClasses.map(cls => new cls(path)).filter(context => context.matches())
        if (contextMatches.length  == 1) {
          contextMatches[0].handle()
        }
        if (contextMatches.length === 0) {
          throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
        }
        if (contextMatches.length > 1) {
          const contextNames = contextMatches.map(cls => cls.name)
          throw path.buildCodeFrameError(
            `JSX matches multiple contexts (${contextNames}). Please report this to wallace!`
          )
        }
        // TODO: can I just use path.hub?
        const program = path.findParent((path) => path.type == 'Program')
        importChecker.requiresComponentImport(program.hub.file.opts.filename)
      }
    }
  }
}
