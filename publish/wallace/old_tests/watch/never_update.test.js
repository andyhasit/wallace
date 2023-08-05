import {c, load, Component} from '../utils'

let next = 0
function getNext() {
  next ++
  return next
}

class TestComponent extends Component {
  __html__ = '<span :watch="|getNext()|text"></span>'
}


test('Empty property notation only updates once', () => {
  const div = load(TestComponent)
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
})
