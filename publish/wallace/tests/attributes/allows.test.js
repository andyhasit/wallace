const {withDirective} = require('../utils')


describe("Directive with ", () => {
  
  const snippets = {
    "null": 'const Foo = <div test>hello</div>',
    "expr": 'const Foo = <div test={foo}>hello</div>',
    "str": 'const Foo = <div test="bar">hello</div>'
  }

  const join = (args) => args.join("|")
  // [[argSupplied, argsAllowed, throwError], ...]
  const shouldPass = []
  const shouldFail = []
  const argTypes = ["null", "expr", "str"]

  for (const argType of argTypes) {
    const otherTwo = argTypes.filter(t => t !== argType)
    const otherOne = otherTwo[0]

    shouldPass.push([join([argType]), argType])
    shouldPass.push([join([argType, otherOne]), argType])
    shouldPass.push([join([argType, ...otherTwo]), argType])
    shouldFail.push([join([otherOne]), argType, true])
    shouldFail.push([join(otherTwo), argType, true])
  }

  test.each(shouldPass)("allows %p accepts %p", (allow, argType) => {
    const opts = {allow}
    const code = snippets[argType]
    const {nodeData, attInfo} = withDirective(code, opts)
    expect(attInfo).toBeDefined()
  })

  test.each(shouldFail)("allows %p throws when given %p", (allow, argType) => {
    const opts = {allow}
    const code = snippets[argType]
    expect(() => withDirective(code, opts)).toThrow(`unknown file: Directive [test] does not allow argument type: "${argType}"`)
  })
})

