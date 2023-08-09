const {parseHTML, preprocessHTML} = require('../utils/dom')

/**
 * Handles the task of parsing a Wallace component, including:
 *
 *  - DOM traversal
 *  - Error context
 */
class DomWalker {
  constructor(html, processNode) {
    //TODO The lookups go wrong if we don't strip the HTML.
    // but then we also lose the line position for showing errors.
    this.html = html
    this.processNode = processNode
    this.dom = undefined
    this.currentNode = undefined
  }
  parse() {
    this.dom = parseHTML(preprocessHTML(this.html))
    const nodePath = []    // The path of current node recursion

    /**
     * Called recursively to process each node in the DOM
     */
    const walkNode = (node, i) => {
      const childNodes = Array.from(node.childNodes)
      this.currentNode = node
      if (i !== undefined) {
        nodePath.push(i)
      }
      const tagName = node.tagName
      this.processNode({nodePath, node, tagName})
      childNodes.forEach(walkNode)
      nodePath.pop()
    }
    walkNode(this.dom)
  }
  /**
   * Exit with an error.
   * TODO: flesh this out to print more useful info.
   */
  throw(message) {
    // console.log(this.currentNode)
    new Error(message)
  }
}


module.exports = {DomWalker}