import {c, load, Component} from '../utils'

let next = 0
function getNext() {
  next ++
  return next
}

const Foo = <span>{N|getNext()}</span>

test('Empty property notation only updates once', () => {
  const div = load(Foo)
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
})
