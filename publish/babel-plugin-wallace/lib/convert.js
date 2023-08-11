const { parseJSX } = require('./jsx/parse.js')
const { CodeGenerator } = require('./generate/code_generator')


const generatecomponentDefinitionArgs = (componentDefinition) => {

  const {componentName, html, dynamicNodes} = componentDefinition
  const generator = new CodeGenerator(componentName, html)
  dynamicNodes.forEach(node => {
    generator.processNodeWithDirectives(node)
  })
  return generator.buildStatements()
}


const convertJSX = (path, componentName) => {
  return generatecomponentDefinitionArgs(parseJSX(path, componentName))
}


module.exports = {
  convertJSX
}