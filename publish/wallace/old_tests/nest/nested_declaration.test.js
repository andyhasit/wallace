import {load, Component} from '../utils'


class Child extends Component {
  __html__ = '<span>{..name}</span>'
}

class Www extends Component {
  __html__ = '<span>www</span>'
}

class TestComponent extends Component {
  __html__ = html`
    <div>
      <use:Child :props="child1">
      <use:Child :props=".child2"/>
      <use=Child :props=".child3(c)">
      <use=Child :props="child4Props(c)">
      <use=Www >
      <use=Www />
      <use=Www>
      <use=Www/>
    </div>
  `
  init() {
    this.child2 = {name: 'alice'}
    super.init()
  }
  child3(c) {
    args3 = c
    return {name: 'jess'}
  }
}


let args3 = undefined
let args4 = undefined
const child1 = {name: 'jo'}
const child4 = {name: 'ja'}
function child4Props (c) {
  args4 = c
  return child4
}  


test('Nest accepts props', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
      <span>jess</span>
      <span>ja</span>
      <span>www</span>
      <span>www</span>
      <span>www</span>
      <span>www</span>
      </div>
      `)
      child1.name = 'ems'
      child4.name = 'boo'
      div.update()
      expect(div).toShow(`
      <div>
      <span>ems</span>
      <span>alice</span>
      <span>jess</span>
      <span>boo</span>
      <span>www</span>
      <span>www</span>
      <span>www</span>
      <span>www</span>
      </div>
      `)
  expect(args3).toEqual(div.component)
  expect(args4).toEqual(div.component)
})