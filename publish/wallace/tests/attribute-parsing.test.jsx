import {load} from './utils'

test('Static attribute carried over', () => {
  const MyComponent = <div class="bold danger">hello</div>
  const div = load(MyComponent)
  expect(div).toShow(`<div class="bold danger">hello</div>`)
})


test('Dynamic attribute expression', () => {
  const color = "red"
  const MyComponent = <div class={color}>hello</div>
  const div = load(MyComponent)
  expect(div).toShow(`<div class="red">hello</div>`)
})


test('Dynamic attribute in string', () => {
  const color = "red"
  const MyComponent = <div class="{color}">hello</div>
  const div = load(MyComponent)
  expect(div).toShow(`<div class="red">hello</div>`)
})


test('Dunder attribute converted to single underscore', () => {
  const MyComponent = <div __foo="bar">hello</div>
  const div = load(MyComponent)
  expect(div).toShow(`<div _foo="bar">hello</div>`)
})


test('Single underscore treated as directive', () => {
  const MyComponent = <div _show="true">hello</div>
  const div = load(MyComponent)
  expect(div).toShow(`<div>hello</div>`)
})




// TODO: this needs to be tested in babel -plugin?
// test('Invalid directive throws error', () => {
//   const MyComponent = <div _foo={12}>hello</div>
//   const t = () => {
//     div = load(MyComponent)
//   };
//   expect(t).toThrow(SyntaxError);
// })
