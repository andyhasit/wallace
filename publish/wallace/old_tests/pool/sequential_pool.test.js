/*
This checks whether nested components which are detached get told to update,
which they shouldn't.

*/

import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div :use="NestedComponent" :items="*|names">
    </div>
  `
}

class NestedComponent extends Component {
  __html__ = `
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

/* Important to make sure load isn't accidentally called twice somewhere */
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

test('Nested components update again', () => {
  names.push('orange')
  div.update()
  expect(div).toShow(`
    <div>
      <span>apple</span>
      <span>carrot</span>
      <span>kiwi</span>
      <span>orange</span>
    </div>
  `)
  expect(_counter).toEqual({1:2, 2:2, 3:2, 4:1})
})

test('Removed components are not updated', () => {
  names.length = 0
  names.push('lemons')
  div.update()
  expect(div).toShow(`
    <div>
      <span>lemons</span>
    </div>
  `)
  expect(_counter).toEqual({1:3, 2:2, 3:2, 4:1})
})

test('Re-added components are updated', () => {
  names.push('limes')
  div.update()
  expect(div).toShow(`
    <div>
      <span>lemons</span>
      <span>limes</span>
    </div>
  `)
  expect(_counter).toEqual({1:4, 2:3, 3:2, 4:1})
})