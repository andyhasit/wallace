/**
 * Creates and mounts a component onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 * @param {object} parent The parent component (optional)
 */
export function mount(elementOrId, cls, props, parent) {
  const component = createComponent(cls, parent, props);
  replaceNode(getElement(elementOrId), component.el);
  return component;
}

export function replaceNode(nodeToReplace, newNode) {
  nodeToReplace.parentNode.replaceChild(newNode, nodeToReplace);
}

export function getElement(elementOrId) {
  return typeof elementOrId === "string"
    ? document.getElementById(elementOrId)
    : elementOrId;
}

/**
 * Creates a component and initialises it.
 *
 * @param {class} cls The class of Component to create
 * @param {object} parent The parent component (optional)
 * @param {object} props The props to pass to the component (optional)
 */
export function createComponent(cls, parent, props) {
  const component = buildComponent(cls, parent);
  component.props = props;
  component.update();
  return component;
}

/**
 * Builds a component.
 */
export function buildComponent(cls, parent) {
  const component = new cls(parent);
  const prototype = cls.prototype;
  const dom = prototype._n.cloneNode(true);
  component.el = dom;
  component._b(component, dom);
  return component;
}
