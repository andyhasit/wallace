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
    inner: `<span :el="x"></span>`
  }
  init() {
    this.el.inner.el.x.text('YO')
  }
}

test("Save as works in stub", () => {
  const div = load(CustomModal, {title: 'Confirm', content: 'Really?'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>YO</span>
    </div>
  `)
})