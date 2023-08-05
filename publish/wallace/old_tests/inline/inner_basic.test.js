import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span>{..name}</span>
      <span>{.name}</span>
      <span>{service.name}</span>
    </div>
  `
  init() {
    this.name = 'joe'
  }
}

const props = {name: 'bob'}
const service = {name: 'jane'}

test('Inner display correct initial values', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span>bob</span>
      <span>joe</span>
      <span>jane</span>
    </div>
  `)
})

test('Inner update when service changed', () => {
  const div = load(TestComponent, props)
  service.name = 'dave'
  div.update()
  expect(div).toShow(`
    <div>
      <span>bob</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})

test('Inner update when props changed', () => {
  const div = load(TestComponent, props)
  props.name = 'boris'
  div.update()
  expect(div).toShow(`
    <div>
      <span>boris</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})

test('Inner update when new props passed', () => {
  const div = load(TestComponent, props)
  div.setProps({name: 'alice'})
  expect(div).toShow(`
    <div>
      <span>alice</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})