import {load, Component} from '../utils'

const TestComponent = Component.__ex__(html`
  <div>{..name}</div>
`)

test("Creates component definition", () => {
  let div = load(TestComponent, {name: 'A'})
  expect(div).toShow(`
    <div>A</div>
  `)
})


const TestComponent2 = Component.__ex__(html`
  <div>{.name}</div>
`, {init: function(){
  this.name = 'B'
}})



test("Definition include prototype", () => {
  let div = load(TestComponent2)
  expect(div).toShow(`
    <div>B</div>
  `)
})