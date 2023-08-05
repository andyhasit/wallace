import {load, Component} from '../utils'

class Component1 extends Component {
  __html__ = html`
    <div>meh</div>
  `
  yolo = 1
}


class Component2 extends Component {
  __html__ = html`
    <div>meh</div>
  `
  __stubs__ = {
    footer: html`<span>{footer}</span>`
  }
  yolo = 2
}

test("Components retain class properties", () => {
  const div1 = load(Component1)
  const div2 = load(Component2)
  expect(div1.component.yolo).toBe(1)
  expect(div2.component.yolo).toBe(2)
})
