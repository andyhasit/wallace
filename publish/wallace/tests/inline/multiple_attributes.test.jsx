import {load} from '../utils'


const Foo =
    <div>
      <span id={p.id} class={p.style}></span>
    </div>

Foo.prototype.init = function() {
  this.style = 'warning'
}

const props = {style: 'alert', id: 8}

test('Attributes display correct initial values', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div>
      <span id="8" class="alert"></span>
    </div>
  `)
})
