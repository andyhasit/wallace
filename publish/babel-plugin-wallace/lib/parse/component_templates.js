/**
 * Feature temporarily disabled 
 * 
 * This relates to using HTML template files instead of HTML string.
 */

const fs = require("fs")
const path = require('path')
const {parseHTML, stripHtml} = require('../utils/dom')

/**
 * A pool of component templates by path. These are files, typically called components.html
 * which contain the HTML for components.
 */
class ComponentTemplatePool {
  constructor() {
    this._filePools = {}
  }
  getHtml(filepath, className) {
    const dir = path.dirname(filepath)
    const templateFile = path.join(dir, 'components.html')
    if (fs.existsSync(templateFile)) {
      let pooldComponents = this._filePools[templateFile]
      if (pooldComponents === undefined) {
        pooldComponents = this.addToPool(templateFile)
      }
      return pooldComponents[className]
    }
  }
  addToPool(templateFile) {
    const contents = fs.readFileSync(templateFile, {encoding:'utf8', flag:'r'})
    const dom = parseHTML(stripHtml(contents)) // Must strip!
    const filePool = {}
    const childNodes = Array.from(dom.childNodes)
    childNodes.forEach(n => {
      filePool[n.tagName] = n.childNodes[0].outerHTML
    })
    this._filePools[templateFile] = filePool
    return filePool
  }
}

const componentTemplates = new ComponentTemplatePool()
module.exports = {componentTemplates}
