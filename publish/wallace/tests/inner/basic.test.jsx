import {h, load, Component} from '../utils'

const names = ['joe', 'bob', 'alice']

const TestComponent = Component.extend({
  items() {
    return names.map(i => h('span').inner(i))
  }},
  <div call:inner={A|c.items()}></div>
)

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