const babel = require('@babel/core')

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
  insertStatementsAfter
}