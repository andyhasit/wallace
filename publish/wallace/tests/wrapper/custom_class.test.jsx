import {load, Wrapper} from '../utils'

const Foo = <span wrapper={SpecialWrapper} watch={p.name|w.text(n)}></span>


class SpecialWrapper extends Wrapper {
  text(value) {
     this.e.textContent = 'ALICE'
     return this
  }
}


const props = {name: 'joe'}

test('Custom wrapper class is used', () => {
  const div = load(Foo, props)
  expect(div).toShow('<span>ALICE</span>')
})
