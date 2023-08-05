import {c, h, load, Component} from '../utils'


const names = ['joe', 'bob', 'alice']

class TestComponent extends Component {
  __html__ = `
    <div :watch="|.items()|inner">
    </div>
  `
  items() {
    return names.map(i => h('span').inner(i))
  }
}

test('Nest without pool declaration adds wrappers', () => {
  const div = load(TestComponent)

  expect(div).toShow(`
    <div>
      <span>joe</span>
      <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
