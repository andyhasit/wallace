import {c, createComponent, load, Component} from '../utils'


const TestComponent = <div el:root></div>

const NestedComponent = <span>{c.props}</span>
 

test('Top components should be attached', () => {
  const div = load(TestComponent)
  expect(div.component.__ia()).toBe(true)
})


test('Nested components should not be attached until it is', () => {
  const parentComponent = load(TestComponent).component
  const randomComponent = createComponent(NestedComponent, undefined, parentComponent)
  expect(randomComponent.__ia()).toBe(false)
  parentComponent.el.root.child(randomComponent)
  expect(randomComponent.__ia()).toBe(true)
})
