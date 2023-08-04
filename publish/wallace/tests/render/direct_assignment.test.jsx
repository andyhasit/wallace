import {c, load, Component} from '../utils'


const TestComponent =
  <div>
    <span>hello {p.name}</span>
    <span>{service.name}</span>
  </div>
  
const props = {name: 'bob'}
const service = {name: 'jane'}

test('Renders correctly', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span>hello bob</span>
      <span>jane</span>
    </div>
  `)
})