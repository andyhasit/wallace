import {load, Component} from '../utils'

const Child = <span>{p.name}</span>

const Www = <span>www</span>

const TestComponent = Component.extend({
    onInit() {
      this.child2 = {name: 'alice'}
    },
    child3(c) {
      args3 = c
      return {name: 'jess'}
    }
  },
  <div>
    <Child props={child1}/>
    <Child props={c.child2}/>
    <Child props={c.child3(c)} />
    <Child props={child4Props(c)} />
    <Www />
  </div>
)



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
      </div>
      `)
  expect(args3).toEqual(div.component)
  expect(args4).toEqual(div.component)
})