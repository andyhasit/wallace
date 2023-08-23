const {transform, load} = require('./utils')


test("JSX code out of place throws SyntaxError", () => {
  const code = `
    <div>hello</div>
  `
  const t = () => transform(code)
  expect(t).toThrow(SyntaxError)
});


test('Descriptive name', () => {
  let disabled = false
  const Foo = <button disabled={disabled}>test</button>
  const {component, element} = load(Foo)
  
  expect(element.disabled).toBe(false)
  
  disabled = true
  component.update()
  expect(element.disabled).toBe(true)
})