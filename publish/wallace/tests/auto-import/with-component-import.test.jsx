import {load} from '../utils'
// This imports from wallace/dist
import {Component} from 'wallace'

const MyComponent = <div>Hello</div>

test("Component definition works", () => {
  const div = load(MyComponent)
  expect(div).toShow(`
  <div>
    Hello
    </div>
    `)
})
  

// Just to use the import
  const _ = Component