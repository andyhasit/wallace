import {load, Component} from '../utils'

class ComponentWithOwnProps extends Component {
  __html__ = html`
    <div>{..name}</div>
  `
  init() {
    this.props = {name: 'jo'}
    super.init()
  }
}

test("Mounted component can create own props", () => {
  const div = load(ComponentWithOwnProps)
  expect(div).toShow(`
    <div>
      jo
    </div>
  `)
})

class Component1 extends Component {
  __html__ = html`
    <div>
      <use:ComponentWithOwnProps />
    </div>
  `
}

test("Component can create own props", () => {
  const div = load(Component1)
  expect(div).toShow(`
  <div>
    <div>
      jo
    </div>
  </div>
  `)
})
