import {load, Component} from '../utils'


const TestComponent = Component.__ex__({
  html: html`
    <div>{.foo}</div>
  `,
  constructor: function(parent) {
    this.foo = 'A'
    Component.apply(this, parent)
  }  
})

test("Component uses provided constructor", () => {
  let div = load(TestComponent)
  expect(div).toShow(`
    <div>A</div>
  `)
})
