import {load} from '../utils'


const Foo =
  <div>
    <input el:checkbox checked={c.active} type="checkbox"/>
    <span el:span>{c.el.checkbox.e.checked}</span>
  </div>


Foo.prototype.check = function(val) {
  this.active = val
  this.update()
}

test('Element checked property changes', () => {

  const div = load(Foo)
  const component = div.component

  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>false</span>
    </div>
  `)

  // We don't see the change in the HTML, so need to inspect element directly.
  component.check(true)
  expect(component.el.checkbox.e.checked).toBe(true)
  
  component.check(false)
  expect(component.el.checkbox.e.checked).toBe(false)
  
})