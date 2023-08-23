import {load, Component} from '../utils'


const TestComponent = Component.extend({
    init() {
      this.count = 0
    },
    add(by) {
      this.count += by
      console.log(this.count)
      this.update()
    }
  },
  <div>
    <span>{c.count}</span>
    <Button />
  </div>
)


const Button = Component.extend({
    clicked() {
      // this.bubble('add', 2)
    },
    add() {
      throw 'Should skip to parent add method, not own.'
    }
  },
  <button on:click={c.clicked()}>Go</button>
)


test('bubble function as expected', () => {
  const component = load(TestComponent)
  const btn = component.element.childNodes[1]

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