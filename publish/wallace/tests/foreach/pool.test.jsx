import {load, Component, SequentialPool} from '../utils'

const TestComponent = Component.extend({
  onInit() {
    this.name = 'jo'
    this.items = [1, 2, 3]
  }},
  /*
   TODO: improve this.
  
  This fails because we don't get to set 2nd arg which is parent.
    <div pool={pool} call:items={A|c.items}>
  
  And this too because the _for is trying to act on the parent object.
    <div pool={pool} repeat={c.items}>

  Maybe we need the pool directive on the <Child> node?
  Rethink this...

  */
  <div pool={pool} watch={A|w.items(c.items, c)}>
  </div>
)

const Child = <span>{c.parent.name}</span>
const pool = new SequentialPool(Child)


test('Items are linked to parent', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>jo</span>
      <span>jo</span>
    </div>
  `)
})