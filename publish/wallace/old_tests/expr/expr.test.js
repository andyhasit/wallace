import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span>{.age|(n * 2)}</span>
    </div>
  `
  init() {
    this.age = 4
  }
}

test('Expression syntax works', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>8</span>
    </div>
  `)
})