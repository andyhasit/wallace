export const doc = document
const throwAway = doc.createElement('template')

/**
 * Create an element from html string
 */
export function makeEl(html) {
  throwAway.innerHTML = html
  return throwAway.content.firstChild
}

/**
 * Some utility functions
 */
export const und = x => x === undefined
export const isStr = x => typeof x === 'string'
