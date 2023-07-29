
module.exports = () => {
  return {
    visitor: {
      JSXElement(path) {
        var openingElement = path.node.openingElement;  
        var tagName = openingElement.name.name;
        console.log('JSXElement', path.node)
        path.replaceWithSourceString("'I found JSX!")
      }
    }
  }
}
