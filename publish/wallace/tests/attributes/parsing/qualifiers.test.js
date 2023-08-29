const {withDirective} = require('../../utils')


describe("Directive with qualifier=yes", () => {
  const opts = {qualifier: "yes"}

  test("Throws SyntaxError if no qualifier given", () => {
    const code = `const Foo = <div test={foo}>hello</div>`
    expect(() => withDirective(code, opts)).toThrow('unknown file: Directive [test] requires a qualifier.')
  })

  test("Works if qualifier is given", () => {
    const code = `const Foo = <div test:foo={bar}>hello</div>`
    const {nodeData, attInfo} = withDirective(code, opts)
    expect(attInfo.qualifier).toBe("foo")
    expect(attInfo.arg).toBe("bar")
  })
})


describe("Directive with qualifier=no", () => {
  const opts = {qualifier: "no"}

  test("Throws SyntaxError if qualifier is given", () => {
    const code = `const Foo = <div test:foo={bar}>hello</div>`
    expect(() => withDirective(code, opts)).toThrow('unknown file: Directive [test] does not allow a qualifier.')
  })

  test("Works if no qualifier is given", () => {
    const code = `const Foo = <div test={bar}>hello</div>`
    const {nodeData, attInfo} = withDirective(code, opts)
    expect(attInfo.arg).toBe("bar")
  })
})


describe("Directive with qualifier=maybe", () => {
  const opts = {qualifier: "maybe"}

  test("Works if qualifier is given", () => {
    const code = `const Foo = <div test:foo={bar}>hello</div>`
    const {nodeData, attInfo} = withDirective(code, opts)
    expect(attInfo.qualifier).toBe("foo")
    expect(attInfo.arg).toBe("bar")
  })

  test("Works if no qualifier is given", () => {
    const code = `const Foo = <div test={bar}>hello</div>`
    const {nodeData, attInfo} = withDirective(code, opts)
    expect(attInfo.arg).toBe("bar")
  })
})