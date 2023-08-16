import {load} from './utils'

const global = 'jones'
const props = {name: 'bob'}
const service = {name: 'jane'}

const BaseComponent =
  <div id="test">
    <span>hello {p.name}</span>
    <span>{service.name}</span>
    <span>mr {global}</span>
  </div>


const Foo = Component.define({
  _base: BaseComponent
})


test('Renders correctly', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div id="test">
      <span>hello <text>bob</text></span>
      <span>jane</span>
      <span>mr <text>jones</text></span>
    </div>
  `)
})