import {load, Component} from '../utils'


const JsxInFirstArg = Component.define(
  <div>hello</div>
)

test('Detects JSX in first arg of Component.define', () => {
  const div = load(JsxInFirstArg)
  expect(div).toShow(`
    <div>
      hello
    </div>
  `)
})


const JsxInSecondArg = Component.define(
  {},
  <div>hello</div>
)

test('Detects JSX in second arg of Component.define', () => {
  const div = load(JsxInSecondArg)
  expect(div).toShow(`
    <div>
      hello
    </div>
  `)
})