/*
This checks whether nested components which are detached get told to update,
which they shouldn't.

*/

import {load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = html`<div :use="NestedComponent" :items="*|names"></div>`
}

class NestedComponent extends Component {
  __clone__ = `
    <span>{.props}</span>
  `
  init() {
    this.uniqueSeq = getSeq()
  }
  update() {
    super.update()
    updateCounter(this.uniqueSeq)
  }
}

/*
Code to track how many times each component was updated.
*/
let _seq = 0
const _counter = {}
const getSeq = () => {
  _seq ++
  return _seq
}
const updateCounter = (uniqueSeq) => {
  if (!(uniqueSeq in _counter)) {
    _counter[uniqueSeq] = 0
  }
  _counter[uniqueSeq] ++
}


const names = ['apple', 'carrot', 'kiwi']
const div = load(TestComponent)

test('Nested components update just once on load', () => {
  expect(div).toShow(`
    <div>
      <span>apple</span>
      <span>carrot</span>
      <span>kiwi</span>
    </div>
  `)
  expect(_counter).toEqual({1:1, 2:1, 3:1})
})
