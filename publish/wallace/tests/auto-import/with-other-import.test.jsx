import {load} from '../utils'
import {Wrapper} from 'wallace'

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
const w = Wrapper
