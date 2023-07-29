import {load, Component, SequentialPool} from '../utils'


class TestComponent extends Component {
  __html__ = html`
    <div :pool="pool" :el="div" :items="*|.items"></div>
  `
  init() {
    this.name = 'jo'
    this.items = [1, 2, 3]
    super.init()
  }
}


class Child extends Component {
  __html__ = '<span>{.parent.name}</span>'
}

const pool = new SequentialPool(Child)

test('Items are linked to parent', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>jo</span>
      <span>jo</span>
    </div>
  `)
})