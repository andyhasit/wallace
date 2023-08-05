import {load, Component} from '../utils'

class BaseModal extends Component {
  __html__ = `
    <div>
      <div>{..title}</div>
      <stub:inner />
    </div>
  `
}

class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span>{..content}</span>`
  }
}

test("CustomModal uses parent props", () => {
  const div = load(CustomModal, {title: 'Confirm', content: 'Really?'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
    </div>
  `)
})

/**
 * This test is required to ensure that Component.prototype.__av (which gets an anonymous component)
 * doesn't accidentally add stuff to the Component.prototype, which it did in previous commit.
 */

class JustChecking extends Component {}

test("We haven't broken Component prototype", () => {
  const v = new JustChecking()
  expect(v.__ht).toBe(undefined)
  expect(v.__qc).toBe(undefined)
})