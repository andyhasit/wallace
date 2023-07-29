import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span>{.count}</span>
      <use:Button>
    </div>
  `
  init() {
    this.count = 0
  }
  add(by) {
    this.count += by
    this.update()
  }
}


class Button extends Component {
  __html__ = `
    <button :onClick=".clicked(c, p)">Go</button>
  `
  clicked() {
    this.bubble('add', 2)
  }
  add() {
    throw 'Should have tried parent first, not this.'
  }
}

test('bubble function as expected', () => {
  const component = load(TestComponent)
  const btn = component.el.childNodes[1]
  expect(component).toShow(`
    <div>
      <span>0</span>
      <button>Go</button>
    </div>
  `)
  btn.click()
  setTimeout(() => {
    expect(component).toShow(`
      <div>
        <span>2</span>
        <button>Go</button>
      </div>
    `)
  }, 50);
})