import {load} from '../utils'

const MyComponent = <div>Hello</div>

test("Component definition works", () => {
  const div = load(MyComponent)
  expect(div).toShow(`
  <div>
    Hello
  </div>
  `)
})
