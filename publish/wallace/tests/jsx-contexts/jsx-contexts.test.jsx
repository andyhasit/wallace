import {load, Component} from '../utils'


const JsxInFirstArg = Component.extend(
  <div>hello</div>
)

test('Detects JSX in first arg of Component.extend', () => {
  const div = load(JsxInFirstArg)
  expect(div).toShow(`
    <div>
      hello
    </div>
  `)
})


const JsxInSecondArg = Component.extend(
  {},
  <div>hello</div>
)

test('Detects JSX in second arg of Component.extend', () => {
  const div = load(JsxInSecondArg)
  expect(div).toShow(`
    <div>
      hello
    </div>
  `)
})