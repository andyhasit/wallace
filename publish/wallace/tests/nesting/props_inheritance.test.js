import {load, Component} from '../utils'

const TestComponent = Component.extend({
  onInit() {
    this.el.main.child(this.nest(Child))
  }},
  <div>
    <div el:main></div>
    <div>
      <Child props={p} />
    </div>
  </div>
)

const Child = <span>{p.name}</span>


test('Nest can access parent props', () => {
  const props = {name: 'jo'}
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <div><span>jo</span></div>
      <div><span>jo</span></div>
    </div>
  `)
  props.name = 'ja'
  div.update()
  expect(div).toShow(`
    <div>
      <div><span>ja</span></div>
      <div><span>ja</span></div>
    </div>
  `)
})