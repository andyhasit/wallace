import {transform} from '../../utils'


describe('class attribute', () => {
  const foo = "danger"
  
  test("Throws SyntaxError if expr", () => {
    const code = `const Foo = <div class={foo}>hello</div>`
    expect(() => transform(code)).toThrow(
      'unknown file: "class" attribute may not be made dynamic. Use "className" instead, or use css directives.'
    )
  })

  test("Allows string", () => {
    const code = `const Foo = <div class="danger">hello</div>`
    const output = transform(code)
    expect(output).toContain('<div class="danger">hello</div>')
  })
})
