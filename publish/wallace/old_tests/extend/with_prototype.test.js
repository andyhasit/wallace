import {load, Component} from '../utils'

const methods = {
  getName: function(p) {
    return p.name
  }  
}

const TestComponent = Component.__ex__({
  html: html`
    <div>{.getName(p)}</div>
  `,
  prototype: methods
})

test("Component uses provided constructor", () => {
  let div = load(TestComponent, {name: 'A'})
  expect(div).toShow(`
    <div>A</div>
  `)
})
