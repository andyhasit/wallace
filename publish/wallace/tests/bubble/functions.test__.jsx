/**
 * This test is absolutely necessary, as it flags up issues with __ex__ functionality.
 * WHat issues?
 */

import {load, Component} from '../utils'


const TestComponent = Component.define({
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
    <span>{c.count}ff</span>
    <Button />
  </div>
)


const Button = Component.define({
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