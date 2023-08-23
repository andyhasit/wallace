import {load} from '../utils'

const Foo = <span watch={p.name|w.text(n)}></span>


const props = {name: 'joe'}

test('Custom wrapper class is used', () => {
  const div = load(Foo, props)
  expect(div).toShow('<span>joe</span>')
})
