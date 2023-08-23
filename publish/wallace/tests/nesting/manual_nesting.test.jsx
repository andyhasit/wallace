import {load, Component} from '../utils'


const child1 = {name: 'jo'}


const TestComponent = Component.extend({
  onInit() {
    this.el.main.inner([
      this.nest(Child, child1),
      this.nest(Child, {name: 'alice'}),
      this.nest(Child, {name: 'jess'})
    ])
  }},
  <div el:main></div>
)


const Child = <span>{p.name}</span>


test('Nest accepts props', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
  child1.name = 'ems'
  div.update()
  expect(div).toShow(`
    <div>
      <span>ems</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
})