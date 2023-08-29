const {load, withDirective} = require('../../utils')



describe("Escaped attribute", () => {

  test("Retained if value is null", () => {
    const code = `const Foo = <button _disabled>hello</button>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    // TODO: fix this annoying bit...
    expect(result.code).toContain('<button disabled="">hello</button>')
  })

  test("Retained if value is str", () => {
    const code = `const Foo = <div _id="foo">hello</div>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div id="foo">hello</div>')
  })

  test("Removed and turned into dynamic attribute if value is expr", () => {
    const Foo = <div _id={bar}>hello</div>
    const bar = "danger"
    const component = load(Foo)
    expect(component).toShow('<div id="danger">hello</div>')
    expect(component.element.id).toBe("danger")
  })

  test("Truncated correctly", () => {
    const code = `const Foo = <div __id="foo">hello</div>`
    const result = withDirective(code)
    expect(result.nodeData).toBe(undefined)
    expect(result.code).toContain('<div _id="foo">hello</div>')
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