const {load, withDirective} = require('../utils')


describe("Non directive attribute", () => {

  test("Retained if value is null", () => {
    const code = `const Foo = <button disabled>hello</button>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    // TODO: fix this annoying bit...
    expect(result.code).toContain('<button disabled="">hello</button>')
  })

  test("Retained if value is str", () => {
    const code = `const Foo = <div class="foo">hello</div>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div class="foo">hello</div>')
  })

  test("Removed and turned into dynamic attribute if value is expr", () => {
    const Foo = <div class={bar}>hello</div>
    const bar = "danger"
    const component = load(Foo)
    expect(component).toShow('<div>hello</div>')
    expect(component.element.class).toBe("danger")
  })
})