import {c, load, Component} from '../utils'


test('Start and end spacing are stripped', () => {
  const Foo = <span class="  {p.style} "></span>
  
  const div = load(Foo, {style: 'danger'})
  expect(div).toShow('<span class="danger"></span>')
})


test('No space added before if there is none', () => {
  const Foo = <span class="span-{p.style}"></span>

  const div = load(Foo, {style: 'danger'})
  expect(div).toShow('<span class="span-danger"></span>')
})


test('Space before is preserved if there is any', () => {
  const Foo = <span class="span {..style}  "></span>
  
  const div = load(Foo, {style: 'danger'})
  expect(div).toShow('<span class="span danger"></span>')
})


test('Space after is preserved if there is any', () => {
  const Foo = <span class=" {..style} special "></span>

  const div = load(Foo, {style: 'danger'})
  expect(div).toShow('<span class="danger special"></span>')
})


test('No space added after if there is none', () => {
  const Foo = <span class="{..style}-special"></span>
  
  const div = load(Foo, {style: 'danger'})
  expect(div).toShow('<span class="danger-special"></span>')
})