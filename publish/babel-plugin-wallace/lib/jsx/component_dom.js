const {stripHtml, preprocessHTML} = require('../utils/dom')
const {escapeSingleQuotes} = require('../utils/misc')

/**
 * Build the component's DOM as the JSX is parsed, tracking the address of the current
 * node.
 */ 
class ComponentDOM {
  constructor() {
    // The address of the current node processed e.g. [1, 3, 0]
    this._nodeTreeAddress = []
    this._rootElement = undefined
  }
  attach (element) {
    if (this._rootElement) {
      const relativePath = this._nodeTreeAddress.slice(0, -1)
      const parentNode = relativePath.reduce((acc, index) => acc.childNodes[index], this._rootElement)
      parentNode.appendChild(element)
    } else {
      this._rootElement = element
    }
  }
  getHtmlString() {
    return escapeSingleQuotes(stripHtml(preprocessHTML(this._rootElement.outerHTML)))
  }
  getCurrentAddress () {
    return this._nodeTreeAddress.slice()
  }
  push(i) {
    if (i !== undefined) {
      this._nodeTreeAddress.push(i)
    }
  }
  pop() {
    this._nodeTreeAddress.pop()
  }
}


module.exports = {ComponentDOM}