import {c, load, Component, Wrapper} from '../utils'

class TestComponent extends Component {
  __html__ = '<span :wrapper="SpecialWrapper" :watch="*|..name|text"></span>'
}


class SpecialWrapper extends Wrapper {
  text(value) {
    this.e.textContent = 'ALICE'
    return this
  }
}

const props = {name: 'joe'}

test('Custom wrapper class is used', () => {
  const div = load(TestComponent, props)
  expect(div).toShow('<span>ALICE</span>')
})
