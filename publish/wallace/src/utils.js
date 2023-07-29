import {doc, isStr, makeEl} from './helpers'
import {Wrapper} from './wrapper'

/**
 * Creates and mounts a component onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 * @param {object} parent The parent component (optional)
 */
export function mount(elementOrId, cls, props, parent) {
  const component = createComponent(cls, parent, props)
  const nodeToReplace = getElement(elementOrId)
  nodeToReplace.parentNode.replaceChild(component.e, nodeToReplace)
  return component
}

/**
 * returns a Wrapper around an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 */
export function wrap(elementOrId) {
  return new Wrapper(getElement(elementOrId))
}


function getElement(elementOrId) {
  return isStr(elementOrId) ? document.getElementById(elementOrId) : elementOrId
}


/**
 * Creates a component and initialises it.
 *
 * @param {class} cls The class of Component to create
 * @param {object} parent The parent component (optional)
 * @param {object} props The props to pass to the component (optional)
 */
export function createComponent(cls, parent, props) {
  const component = buildComponent(cls, parent)
  component.props = props
  component.init()
  component.update()
  return component
}

/**
 * Builds a component.
 */
export function buildComponent(cls, parent) {
  const component = new cls(parent)
  component.__bv(component, cls.prototype)
  return component
}


/**
 * Creates a wrapper of type tag e.g. h('div')
 */
export function h(tag) {
  return new Wrapper(doc.createElement(tag))
}
