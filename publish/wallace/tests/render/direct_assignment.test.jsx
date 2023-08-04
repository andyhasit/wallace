import {c, load, Component} from '../utils'

const show = false
const props = {name: 'bob'}
const service = {name: 'jane'}

const TestComponent =
  <div id="test">
    <span>hello {p.name}</span>
    <span>{service.name}</span>
    <span _show={show}>hide me</span>
  </div>


test('Renders correctly', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div id="test">
      <span>hello <text>bob</text></span>
      <span>jane</span>
      <span class="hidden">hide me</span>
    </div>
  `)
})