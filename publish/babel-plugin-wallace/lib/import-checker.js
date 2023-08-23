/**
 * Deals with adding `import {Component} from 'wallace'` if necessary.
 */

const filesWhichRequireComponentImport = []
const filesWhichHaveComponentImport = []

const addMissingImports = (path, t) => {
  const filename = path.hub.file.opts.filename
  const needsComponentImport = (
    filesWhichRequireComponentImport.includes(filename) &&
    !filesWhichHaveComponentImport.includes(filename)
  )
  if (needsComponentImport) {
    const specifier = t.ImportSpecifier(t.Identifier("Component"), t.Identifier("Component"))
    const importStatement = t.ImportDeclaration([specifier], t.stringLiteral('wallace'))
    path.unshiftContainer('body', importStatement)
  }
}

const requiresComponentImport = (filename) => {
  filesWhichRequireComponentImport.push(filename)
}

const hasComponentImport = (filename) => {
  filesWhichHaveComponentImport.push(filename)
}

const importChecker = {
  addMissingImports,
  hasComponentImport,
  requiresComponentImport
}

module.exports = {importChecker}