const babel = require('@babel/core')
const {wallaceDefs} = require("../definitions/constants")

/**
 * A visitor which removes a property, because that's how Babel wants you to do it.
 */
const RemoveClassPropertyVisitor = {
  ClassProperty(path) {
    if (wallaceDefs.includes(path.node.key.name)) {
      path.remove()
    }
  }
}

/**
 * Convenience function for removing a property from the visited class.
 */
function removeWallaceDefs(path){
  path.traverse(RemoveClassPropertyVisitor)
}

/**
 * Returns the node's HTML as a string (as it is stored differently if the
 * string uses quasi quotes instead of normal quotes)
 */
function getNodeHtmlString(node) {
  const type = node.type
  if (type === 'TemplateLiteral') {
    return node.quasis[0].value.raw
  } else if (type === 'TaggedTemplateExpression') {
    return node.quasi.quasis[0].value.raw
  } else if (type === 'StringLiteral') {
    return node.value
  }
  return node.value
  // throw new Error(`HTML template value must be a TemplateLiteral\
  //   TaggedTemplateExpression, or StringLiteral (found ${type}).`)
}


function getNodeHtmlObjectOfStrings(node) {
  const htmlStrings = {}
  node.properties.forEach(element => {
    htmlStrings[element.key.name] = getNodeHtmlString(element.value)
  })
  return htmlStrings
}

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

module.exports = {
  getNodeHtmlString,
  getNodeHtmlObjectOfStrings,
  insertStatementsAfter,
  removeWallaceDefs
}