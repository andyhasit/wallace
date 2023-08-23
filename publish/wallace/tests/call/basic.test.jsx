import {load} from '../utils'


test('Call without transormation', () => {
  const Foo = <span call:text={p.name}></span>
  const div = load(Foo,  {name: 'joe'})
  expect(div).toShow('<span>joe</span>')
})


test('Call with transormation', () => {
  const Foo = <span call:text={p.name|n.toUpperCase()}></span>
  const div = load(Foo,  {name: 'joe'})
  expect(div).toShow('<span>JOE</span>')
})
