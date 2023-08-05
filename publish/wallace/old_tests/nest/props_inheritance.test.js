import {load, Component} from '../utils'

class TestComponent extends Component {
  __html__ = html`
    <div>
      <div :el="main"></div>
      <div>
        <use:Child :props="p">
      </div>
    </div>
  `
  init() {
    this.el.main.child(this.nest(Child))
    super.init()
  }
}


class Child extends Component {
  __html__ = '<span>{..name}</span>'
}


test('Nest can access parent props', () => {
  const props = {name: 'jo'}
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <div><span>jo</span></div>
      <div><span>jo</span></div>
    </div>
  `)
  props.name = 'ja'
  div.update()
  expect(div).toShow(`
    <div>
      <div><span>ja</span></div>
      <div><span>ja</span></div>
    </div>
  `)
})