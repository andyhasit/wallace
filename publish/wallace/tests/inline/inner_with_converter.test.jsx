import {c, load, Component} from '../utils'

const props = {
  name: 'bob',
  foo: function(n) {
    return `${n} from props`
  }
}

function foo(n) {
  return `${n} from global`
}

const Foo =
    <div>
      <span>{p.name|p.foo(n)}</span>
      <span>{p.name|c.foo(n)}</span>
      <span>{p.name|foo(n)}</span>
    </div>

Foo.prototype.foo = function(n) {
  return `${n} from this`
}


test('Convert functions called on load', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div>
      <span>bob from props</span>
      <span>bob from this</span>
      <span>bob from global</span>
    </div>
  `)
})

test('Convert functions called on update', () => {
  const div = load(Foo, props)
  props.name = 'jane'
  div.update()
  expect(div).toShow(`
    <div>
      <span>jane from props</span>
      <span>jane from this</span>
      <span>jane from global</span>
    </div>
  `)
})