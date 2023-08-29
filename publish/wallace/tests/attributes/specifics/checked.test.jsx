import {load} from '../../utils'


test('checked attribute works', () => {
  let check = false
  const Foo = <input type="checkbox" checked={check}/>
  const component = load(Foo)
  
  expect(component).toShow('<input type="checkbox">')
  expect(component.element.checked).toBe(false)
  
  check = true
  component.update()
  expect(component.element.checked).toBe(true)
})
