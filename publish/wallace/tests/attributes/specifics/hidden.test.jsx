import {load} from '../../utils'


test('hidden attribute works', () => {
  let hide = false
  const Foo = <div hidden={hide}>hello</div>
  const component = load(Foo)
  
  expect(component).toShow('<div>hello</div>')
  expect(component.element.hidden).toBe(false)
  
  hide = true
  component.update()
  expect(component.element.hidden).toBe(true)
})
