import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div :el="x">
      <div>
        <span :el="y"></span>
      </div>
      <span :el="z"></span>
    </div>
  `
  init() {
    this.el.x.css('x')
    this.el.y.css('y')
    this.el.z.css('z')
  }
}

test('Named elements saved correctly', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div class="x">
      <div>
        <span class="y"></span>
      </div>
      <span class="z"></span>
    </div>
  `)
})