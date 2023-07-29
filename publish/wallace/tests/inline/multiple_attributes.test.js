import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span id="{..id}" class="{..style}"></span>
    </div>
  `
  init() {
    this.style = 'warning'
  }
}

const props = {style: 'alert', id: 8}

test('Attributes display correct initial values', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span id="8" class="alert"></span>
    </div>
  `)
})
