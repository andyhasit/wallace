import {load, Component} from '../utils'


const TestComponent = Component.extend({
    onInit() {
      this.name = 'jo'
      this.items = [1, 2, 3]
    }
  },
  <div>
    <Child repeat={c.items}/>
  </div>
)


const Child = <span>{c.parent.name}</span>


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