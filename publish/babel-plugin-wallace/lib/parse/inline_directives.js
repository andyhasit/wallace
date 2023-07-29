/**
 * This module deals with parsing inline directives and building the 
 * watch objects.
 */
const {splitter} = require('../definitions/constants')
const {extractAtts, isLeafNode, removeAtt} = require('../utils/dom')
const {escapeSingleQuotes, clearIfEmpty, replaceArgs} = require('../utils/misc')
const {config} = require('../config/base_config')

// Settings for inline directives
const [startDelimiter, endDelimiter] = config.options.inlineDelimiters

if (startDelimiter.length !== 1 || endDelimiter .length !== 1) {
  throw new Error('Configuration error: start and end delimiters must be single characters.')
}
// Currently on works if length is 1!
//const delimiterLength = startDelimiter.length

/**
 * Finds the inline calls and adds watches. Also modifies the
 * actual node object to remove inline call code.
 * 
 * @param {node} node A node from babel.
 *
 * @return {number} An array of watch objects as [{name, converter, wrapperMethod}...]
 */
const processInlineWatches = (nodeData, node) => {
  const atts = extractAtts(node)
  const restrictedAtts = Object.values(config.directives)

  // extract from node's attributes
  for (let [key, value] of Object.entries(atts)) {
    if (value && !restrictedAtts.includes(key)) {
      // The @ notation is handled downstream, but if class we can just convert to css()
      let usedKey = key === 'class' ? 'css' : `@${key}`
      if (addInlineWatches(nodeData, value, usedKey, false)) {
        removeAtt(node, key)
      }
    }
  }
  
  if (node.nodeType === 3) {
    /*
    This means we are in a text node:

      <div>
        hello {name}      <<<
        <br>
        goodbye           <<<
      </div>

    If it has inline directives it must be replaced with something so that
    the final dom has a textElement there too, else the structure will differ
    and the path to node will be wrong, so we use a placeholder instead of
    an empty string.
    */
    if (addInlineWatches(nodeData, node.textContent, 'text', true)) {
      node.textContent = '#'
    }
  }

}


/**
 * Adds watches to nodeData.watches.
 * 
 * function (n, o, w, p, c) {
 *   // Line goes here
 * }
 * 
 * Line could be:
 * 
 *  w.text(n);
 *  w.text(c.foo(n, o, w, p, c));
 * 
 * If multiple properties are watched, we move the logic to a lookup:
 * 
 * {
 *  foo: function(n, o, w, p, c) {
 *     return 'Hi ' + p.name + ' it is ' + p.date;
 *   }
 * }
 * 
 * And call that:
 * 
 *  w.text(c.lookup('foo'));
 * 
 * Because we don't want to duplicate that code in both callbacks.
 */
const addInlineWatches = (nodeData, inlineText, wrapperMethod, saveSingleSpace) => {
  if (inlineText === undefined) {
    return false
  }
  const {watchedProperties, chunks} = parseInlineText(inlineText)
  const watchedPropertyCount = watchedProperties.length
  if (watchedPropertyCount === 0) {
    return false
  }
  if (watchedPropertyCount === 1) {
    const watchedProperty = watchedProperties[0]
    addInlineWatchesForSingleDirective(nodeData, wrapperMethod, chunks, watchedProperty, saveSingleSpace)
  } else {
    addInlineWatchesForMultipleDirectives(nodeData, wrapperMethod, chunks, watchedProperties, saveSingleSpace)
  }
  return true
}

/**
 * Adds in inline watch, for when there is only one directive in the text.
 * @param {object} nodeData
 * @param {string} wrapperMethod
 * @param {Array} chunks 
 * @param {string} watch 
 * @param {boolean} saveSingleSpace 
 */
const addInlineWatchesForSingleDirective = (nodeData, wrapperMethod, chunks, watchedProperty, saveSingleSpace) => {
  let converter = buildConcatStatement(nodeData, chunks, expandChunkConverterSingleMode, saveSingleSpace)
  // Put in brackets so it is treated as raw JS.
  converter = `(${converter})`
  nodeData.addWatch(watchedProperty, converter, wrapperMethod)
}

/**
 * Adds in inline watch, for when there are multiple directives in the text.
 * @param {object} nodeData
 * @param {string} wrapperMethod
 * @param {Array} chunks 
 * @param {string} watch 
 * @param {boolean} saveSingleSpace 
 */
const addInlineWatchesForMultipleDirectives = (nodeData, wrapperMethod, chunks, watchedProperties, saveSingleSpace) => {
  let concatStatement = buildConcatStatement(nodeData, chunks, expandChunkConverterMultipleMode, saveSingleSpace)
  // Put in brackets so it is treated as raw JS.
  const lookupKey = nodeData.getUniqueKey()
  nodeData.addLookup(lookupKey, concatStatement)
  watchedProperties.forEach(p => 
    nodeData.addWatch(p, undefined, wrapperMethod, undefined, lookupKey)
  )
}

/**
 * Builds a javascript string concatenating the chunks, which are a mix of 
 * strings and directives.
 * 
 * @param {Array} nodeData 
 * @param {Array} chunks 
 * @param {Function} expander 
 */
const buildConcatStatement = (nodeData, chunks, expander, saveSingleSpace) => {
  chunks = chunks.map(chunk => {
    if (typeof chunk == 'object') {
      return expander(nodeData, chunk)
    } else {
      return `'${escapeSingleQuotes(chunk)}'`
    }
  })

  // We now want to strip (or even remove if blank) the first and last
  // chunks if they are text. Don't strip anything else!
  
  const chunkCount = chunks.length
  const firstItem = chunks[0]
  const lastItem = chunks[chunkCount - 1]
  if (typeof firstItem == 'string') {
    chunks[0] = trimIfQuoted(firstItem, 'start', saveSingleSpace)
  }
  if (typeof lastItem == 'string') {
    chunks[chunkCount - 1] = trimIfQuoted(lastItem, 'end', saveSingleSpace)
  }
  return chunks.filter(c => c).join('+') + ' '
}

/**
 * Will trim the start or end of a string if it is a quoted string "'like this '"
 * 
 * If string is not quoted, returns as is.
 * If string is quoted but contains only whitespace, returns undefined.
 * 
 * @param {string} chunk 
 * @param {string} trimFrom - start or end
 * @param {boolean} saveSingleSpace - whether to save a single space at start or end.
 */
const trimIfQuoted = (chunk, trimFrom, saveSingleSpace) => {
  let trimMethod
  if (trimFrom === 'start') {
    trimMethod = 'trimStart'
  } else if (trimFrom === 'end') {
    trimMethod = 'trimEnd'
  } else {
    throw new Error('Argument trimFrom must be "start" or "end", not :' + trimFrom)
  }
  if (chunk.startsWith("'")) {
    let trimmed = chunk.slice(1, -1)[trimMethod]()

    // If string was trimmed and we want to save single space, add it back
    // to the start or end as appropriate.
    if (saveSingleSpace && (chunk.length >  trimmed.length)) {
      trimmed = trimFrom === 'start' ? (' ' + trimmed) : (trimmed + ' ')
    }
    if (trimmed.length > 0 ) {
      return "'" + trimmed + "'"
    }
    return undefined // we want this.
  }
  // Not a quoted chunk so we don't want to change anything.
  return chunk
}

/**
 * Expands a directive chunk in single mode, i.e. only one watched value,
 * which is already available as 'n'.
 * 
 * @param {Object} nodeData 
 * @param {Object} directiveChunk -- a chun
 */
const expandChunkConverterSingleMode = (nodeData, directiveChunk) => {
  if (directiveChunk.converter) {
    return nodeData.expandValueSlot(directiveChunk.converter)
  } else {
    return 'n'
  }
}

/**
 * Expands a directive chunk in multiple directive mode:
 * 
 * <span>The book {..title} was written by {..author|pretty(c, n)}<span>
 * 
 * Should give:
 * 
 *  ' The book ' + p.book + ' was written by ' + pretty(c, p.author) + ' ' 
 * 
 * @param {Object} nodeData 
 * @param {Object} directiveChunk -- a chunk
 */
const expandChunkConverterMultipleMode = (nodeData, directiveChunk) => {
  const value = nodeData.expandValueSlot(directiveChunk.property)
  if (directiveChunk.converter) {
    const converter = nodeData.expandValueSlot(directiveChunk.converter)
    return replaceArgs(converter, 'n', value)
  } else {
    return value
  }
}

/**
 * Parses a piece of text, returning an object {watchedProperties, chunks}.
 * 
 * This:
 *
 *  "Hello {firstname|capitalise} it's {date}" 
 * 
 * Becomes:
 * 
 *   {
 *     watchedProperties: [firstname, date]
 *     chunks: [
 *       "Hello ",
 *       {property: "firstname", converter: "capitalise"},
 *       " it's ",
 *       {property: "date", converter: undefined}
 *     ]
 *   }
 * 
 * @param {string} inlineText 
 */
const parseInlineText = (inlineText) => {
  let watchedProperties = []
  let chunks = []
  let nestedDepth = 0
  let currentChunk = ''

  const saveChunkAndStartNew = () => {
    if (currentChunk !== '') {
      chunks.push(currentChunk)
    }
    currentChunk = ''
  }

  const handleOpenBracket = (freeTextMode) => {
    if (freeTextMode) {
      currentChunk = currentChunk.slice(0, -1)
      saveChunkAndStartNew()
    }
    nestedDepth ++
  }

  const handleCloseBracket = (freeTextMode) => {
    if (freeTextMode) {
      throw new Error(`Encountered ${endDelimiter} in free text.`)
    } 
    if (nestedDepth === 1) {
      currentChunk = converterInline(currentChunk.slice(0, -1))
      let property = currentChunk.property
      if (! watchedProperties.includes(property)) {
        watchedProperties.push(property)
      }
      saveChunkAndStartNew()
    }
    nestedDepth --
  }

  const converterInline = (text) => {
    const [property, converter] = text.split(splitter).map(s => s.trim())
    return {property, converter}
  }

  for (let i=0, il=inlineText.length; i<il; i++) {
    let char = inlineText[i]
    currentChunk += char  // this may include the close or start bracket
    let freeTextMode = nestedDepth === 0
    if (char === startDelimiter) {
      handleOpenBracket(freeTextMode)
    } else if (char === endDelimiter) {
      handleCloseBracket(freeTextMode)
    }
  }
  saveChunkAndStartNew()
  return {watchedProperties, chunks}
}

module.exports = {processInlineWatches}
