const {load, withDirective} = require('../utils')



describe("Escaped attribute", () => {

  test("Retained if value is null", () => {
    const code = `const Foo = <button _disabled>hello</button>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    // TODO: fix this annoying bit...
    expect(result.code).toContain('<button disabled="">hello</button>')
  })

  test("Retained if value is str", () => {
    const code = `const Foo = <div _class="foo">hello</div>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div class="foo">hello</div>')
  })

  test("Removed and turned into dynamic attribute if value is expr", () => {
    const Foo = <div _class={bar}>hello</div>
    const bar = "danger"
    const component = load(Foo)
    expect(component).toShow('<div>hello</div>')
    expect(component.element.class).toBe("danger")
  })

  test("Truncated correctly", () => {
    const code = `const Foo = <div __class="foo">hello</div>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div _class="foo">hello</div>')
  })
})


describe("Escaped directive", () => {
  const opts = {allow: "expr|null|str"}

  test("Retained if value is null", () => {
    const code = `const Foo = <button _test>hello</button>`
    const result = withDirective(code, opts)
    expect(result.nodeData).toBe(undefined)
    // TODO: fix this annoying bit...
    expect(result.code).toContain('<button test="">hello</button>')
  })

  test("Retained if value is str", () => {
    const code = `const Foo = <div _test="foo">hello</div>`
    const result = withDirective(code, opts)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div test="foo">hello</div>')
  })

  test("Removed and turned into dynamic attribute if value is expr", () => {
    const Foo = <div test={bar}>hello</div>
    const bar = "danger"
    const component = load(Foo)
    expect(component).toShow('<div>hello</div>')
    expect(component.element.test).toBe("danger")
  })

})