import {load} from '../utils'


const Foo =
  <div>
    <input el:checkbox/>
    <button el:btn>Click me</button>
    <span el:span></span>
  </div>


Foo.prototype.init = function() {
  this.el.checkbox.css('x')
  this.el.btn.css('y')
  this.el.span.css('z')
}


test('Named elements saved correctly', () => {
  const div = load(Foo)
  expect(div).toShow(`
  <div>
    <input class="x">
    <button class="y">Click me</button>
    <span class="z"></span>
  </div>
  `)
})