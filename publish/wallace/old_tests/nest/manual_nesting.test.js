import {c, h, load, Component} from '../utils'


const child1 = {name: 'jo'}


class TestComponent extends Component {
  __html__ = html`
    <div :el="main">
    </div>
  `
  init() {
    this.el.main.inner([
      this.nest(Child, child1),
      this.nest(Child, {name: 'alice'}),
      this.nest(Child, {name: 'jess'})
    ])
    super.init()
  }
}


class Child extends Component {
  __html__ = '<span>{..name}</span>'
}


test('Nest accepts props', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
  child1.name = 'ems'
  div.update()
  expect(div).toShow(`
    <div>
      <span>ems</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
})