const {jsxContextClasses} = require('./jsx_contexts')

const imports = []

module.exports = () => {
  return {
    visitor: {
      ImportDeclaration: {
        exit(path) {
          // console.log(path.node.source);
          // specifiers: {component, mount}
          // source: "wallace"
          console.log(path);
        }
      },
      ImportDeclaration({ node }) {
        const modulePath = node.source.value;
        node.specifiers.forEach(specifier => {
          const alias = specifier.local.name;
          let name;
          switch (specifier.type) {
            case 'ImportSpecifier':
              name = specifier.imported.name;
              break;
            case 'ImportDefaultSpecifier':
              name = 'default';
              break;
            case 'ImportNamespaceSpecifier':
              name = '*';
              break;
          }
          if (name) {
            imports.push({
              alias,
              name,
              source: modulePath,
            });
          }
        });
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
          // throw path.buildCodeFrameError("Found JSX in a place Wallace doesn't know how to handle.")
        }
        if (contextMatches.length > 1) {
          const contextNames = contextMatches.map(cls => cls.name)
          throw path.buildCodeFrameError(`JSX matches multiple contexts (${contextNames}). Please report this to wallace!`)
        }
      }
    }
  }
}
