import {load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = html`
    <div :use="Child" :items="*|.items"></div>
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