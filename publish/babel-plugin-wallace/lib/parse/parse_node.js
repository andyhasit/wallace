const {extractAtts, getAttNames, getAttVal, removeAtt} = require('../utils/dom')
const {RequestsHelp} = require('../definitions/constants')
const {NodeData} = require('../definitions/node_data')
const {processInlineWatches} = require('./inline_directives')
const {processDirective} = require('../config/parse_directives')
const {config} = require('../config/base_config')

/**
 * Extracts the relevant data from the HTML node, and removes parts that need removed.
 * Returns a NodeData object if there are directives found.
 * 
 * @param {Object} node - a nodeInfo instance from the walker
 * @param {DomWalker} walker - the walker itself (just for raising exceptions)
 * @param {boolean} processAsStub - indicates whether we are processing a stub.
 */
function extractNodeData(node, walker, processAsStub) {
  const nodeData = new NodeData(node, processAsStub)
  let hasData = false

  // First check for help, as there is potentially broken syntax further down
  const attNames = getAttNames(node)
  const helpCallIndex = attNames.indexOf('?')
  let helpTopic = undefined
  if (helpCallIndex > -1) {
    if (attNames.length > helpCallIndex + 1) {
      helpTopic = attNames[helpCallIndex + 1]
    }
    throw new RequestsHelp(helpTopic)
  }

  // Check attributes for directives
  if (node.attributes && node.attributes.length > 0) {
    for (let [directiveName, directive] of Object.entries(config.directives)) {
      let attVal = getAttVal(node, directiveName)
      if (attVal) {
        // To deal with <use:Child/>
        if (attVal.endsWith('/')) {
          attVal = attVal.substring(0, attVal.length -1)
        }
        hasData = true
        processDirective(nodeData, directiveName, directive, attVal)
        removeAtt(node, directiveName)
      }
    }
  }

  // Process event attributes, we need to call extractAtts() again.
  const remainingAtts = extractAtts(node)
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
        removeAtt(node, key)
      }
    }
  }

  // Check inline calls
  processInlineWatches(nodeData, node)
  hasData = hasData || nodeData.watches.length > 0

  return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}