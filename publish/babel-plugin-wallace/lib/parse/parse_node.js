const {extractAtts, getAttNames, getAttVal, removeAtt} = require('../utils/dom')
const {RequestsHelp} = require('../definitions/constants')
const {NodeData} = require('../definitions/node_data')
const {processInlineWatches} = require('./inline_directives')
const {processDirective} = require('../config/parse_directives')
const {config} = require('../config')

/**
 * Extracts the relevant data from the HTML node, and removes parts that need removed.
 * Returns a NodeData object if there are directives found.
 * 
 * @param {Object} domNode - a Babel AST node
 * @param {boolean} processAsStub - indicates whether we are processing a stub.
 */
function extractNodeData(domNode, processAsStub) {
  const nodeData = new NodeData(domNode, processAsStub)
  let hasData = false

  // First check for help, as there is potentially broken syntax further down
  // const attNames = getAttNames(node)
  // const helpCallIndex = attNames.indexOf('?')
  // let helpTopic = undefined
  // if (helpCallIndex > -1) {
  //   if (attNames.length > helpCallIndex + 1) {
  //     helpTopic = attNames[helpCallIndex + 1]
  //   }
  //   throw new RequestsHelp(helpTopic)
  // }

  // Check attributes for directives
  if (domNode.attributes && domNode.attributes.length > 0) {
    for (let [directiveName, directive] of Object.entries(config.directives)) {
      let attVal = getAttVal(domNode, directiveName)
      if (attVal) {
        // To deal with <use:Child/>
        if (attVal.endsWith('/')) {
          attVal = attVal.substring(0, attVal.length -1)
        }
        hasData = true
        processDirective(nodeData, directiveName, directive, attVal)
        removeAtt(domNode, directiveName)
      }
    }
  }

  // Process event attributes, we need to call extractAtts() again.
  const remainingAtts = extractAtts(domNode)
  if (remainingAtts) {
    for (let [key, value] of Object.entries(remainingAtts)) {
      if (key.toLowerCase().startsWith(':on')) {
        let event = key.substr(3)
        let directive = {
          params: 'callbackStr',
          handle: function(callbackStr) {
            this.addEventListener(event, callbackStr)
          }
        }
        processDirective(nodeData, key, directive, value)
        hasData = true
        removeAtt(domNode, key)
      }
    }
  }

  // Check inline calls
  processInlineWatches(nodeData, domNode)
  hasData = hasData || nodeData.watches.length > 0

  return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}