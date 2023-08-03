const t = require('@babel/types')
const {getJSXprocessor} = require('./jsx_processors')

module.exports = () => {
  return {
    visitor: {
      ImportDeclaration: {
        exit(path) {
          // console.log(path.node.source);
        }
      },
      JSXElement(path) {
        // The JSXprocessor deletes this node, so this function only ever catches the
        // root JSXElement.

        // TODO: change to...
        // JSXProcessorClasses.map()filter(processor => new processor.match())
        const processor = getJSXprocessor(path)
        processor.process()
      }
    }
  }
}
