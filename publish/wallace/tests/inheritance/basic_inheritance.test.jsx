import {load, Component} from '../utils'


const caps = (n) => n.toUpperCase()
const person = {name: 'Hortense'}

const ParentComponent = Component.extend({
  getHeight() {
    return 175
  }},
  <div>
    <div>{p.name}</div>
    <div>{c.getHeight()}</div>
  </div>
)


const ChildComponent1 = Component.extend({
  _base: ParentComponent,
  getHeight() {
    return 200
  }
})


const ChildComponent2 = Component.extend({
  _base: ParentComponent,
  } ,
    <div>
      <div>{p.name | caps(n)}</div>
      <div>{c.getHeight()}</div>
    </div>
)

test("ChildComponent1 uses parent's generated code", () => {
  const div = load(ChildComponent1, person)
  expect(div).toShow(`
    <div>
      <div>Hortense</div>
      <div>200</div>
    </div>
  `)
})

test("ChildComponent2 uses own generated code, but inherits method", () => {
  const div = load(ChildComponent2, person)
  expect(div).toShow(`
    <div>
      <div>HORTENSE</div>
      <div>175</div>
    </div>
  `)
})