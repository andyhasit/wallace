import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `<div>Hi! my name's "Dave"</div>`
}

test('Quotes are handled correctly', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>Hi! my name's "Dave"</div>
  `)
})