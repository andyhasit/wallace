const { parseJSX } = require('./jsx/parse.js')
const { CodeGenerator } = require('./generate/code_generator')
const {allVariableLetters} = require('./definitions/constants')

const generatecomponentDefinitionArgs = (componentDefinition) => {

  const {componentName, html, dynamicNodes} = componentDefinition
  const generator = new CodeGenerator(componentName, html)
  dynamicNodes.forEach(node => {
    generator.processNodeWithDirectives(node)
  })
  return generator.buildStatements()
}


const convertJSX = (path, componentName) => {
  const parsedData = parseJSX(path, componentName)
  for (const letter of allVariableLetters) {
    delete path.scope.globals[letter]
  }
  return generatecomponentDefinitionArgs(parsedData)
}


module.exports = {
  convertJSX
}