import {load, Component} from '../utils'


const caps = (n) => n.toUpperCase()
const person = {name: 'Hortense'}

class ParentComponent extends Component {
  __html__ = `
    <div>
      <div>{..name}</div>
      <div>{.getHeight()}</div>
    </div>
  `
  getHeight() {
    return 175
  }
}

class ChildComponent1 extends ParentComponent {
  getHeight() {
    return 200
  }
}

class ChildComponent2 extends ParentComponent {
  __html__ = `
    <div>
      <div>{..name | caps(n)}</div>
      <div>{.getHeight()}</div>
    </div>
  `
}

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