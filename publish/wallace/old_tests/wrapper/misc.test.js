import {c, load, Component, Wrapper} from '../utils'

class TestComponent extends Component {
  __html__ = html`
    <div>
      <span :el="label"></span>
      <input :el="nameInput">
      <span :el="test"></span>
    </div>
  `
  init() {
    this.el.label.text('Name:').css('bold')
    this.el.nameInput.value('Bob')
    this.el.test.text(this.el.nameInput.getValue())
  }
}


test('Misc wrapper properties', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
  <div>
    <span class="bold">Name:</span>
    <input>
    <span>Bob</span>
  </div>
  `)
})