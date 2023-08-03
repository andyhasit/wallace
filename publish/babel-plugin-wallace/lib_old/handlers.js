const {RequestsHelp, FrameworkError} = require('./definitions/constants')
const {CodeGenerator} = require('./generate/code_generator')
const {buildHelpLoaderStatements} = require('./help-system/entry')

/**
 * Handles an 
 * @param {string} componentName - the name of the component definition
 * @param {string} html - The html string.
 * @param {*} path - the babel AST path
 */
const handleHtml = (componentName, html, path) => {
  return generateStatements(componentName, html, false, path)
}


const handleStubs = (componentName, stubs, path) => {
  const statements = []
  for (const [stubName, stubHtml] of Object.entries(stubs)) {
    let anonymousCls = path.scope.generateUidIdentifier("sv").name
    statements.push(`var ${anonymousCls} = ${componentName}.prototype.__sv();`)
    statements.push(`${componentName}.prototype.__stubs__${stubName} = ${anonymousCls};`)
    generateStatements(anonymousCls, stubHtml, true, path).forEach(statement => {
      statements.push(statement)
    })
  }
  return statements
}


const generateStatements = (className, html, processAsStub, path) => {
  let statements
  try {
    const builder = new CodeGenerator(className, html, processAsStub, path)
    statements = builder.buildStatements()
  } catch (error) {
    if (error instanceof RequestsHelp) {
      return buildHelpLoaderStatements(error.topic)
    } else if (error instanceof FrameworkError) {
      const bar = '|'
      const hr =     '|----------------------------------------------------------------------'
      const header = '|  Error in component definition (specific location not available yet).'
      const errorMessage = `${bar}  > ${error.msg}`
      const fullMessage = ['\n', hr, bar, header, bar, errorMessage, bar, hr].join('\n')
      throw path.buildCodeFrameError(fullMessage)
    } else {
      throw error
    }
  }
  return statements
}

module.exports = {handleHtml, handleStubs}