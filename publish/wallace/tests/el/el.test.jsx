import {load} from '../utils'


const Foo =
  <div>
    <input _el:checkbox/>
    <button _el:btn>Click me</button>
    <span _el:span></span>
  </div>


Foo.prototype.init = function() {
  this.el.checkbox.css('x')
  this.el.btn.css('y')
  this.el.span.css('z')
}


test('Named elements saved correctly', () => {
  const div = load(Foo)
  div.el
  expect(div).toShow(`
  <div>
    <input class="x">
    <button class="y">Click me</button>
    <span class="z"></span>
  </div>
  `)
})