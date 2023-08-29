import {load} from '../../utils'


test('disabled attribute works', () => {
  let disable = false
  const Foo = <button disabled={disable}>hello</button>
  const component = load(Foo)
  
  expect(component).toShow('<button>hello</button>')
  expect(component.element.disabled).toBe(false)
  
  disable = true
  component.update()
  expect(component.element.disabled).toBe(true)
})
