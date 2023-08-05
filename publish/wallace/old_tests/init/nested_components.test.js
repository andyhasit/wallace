import {c, h, load, Component} from '../utils'

const names = []

class ParentComponent extends Component {
  __html__ = `
    <div>
      <use:ChildComponent :props=".child1Props"/>
      <use:ChildComponent :props=".child2Props"/>
    </div>
  `
  init() {
    this.buildProps()
    super.init()
  }
  buildProps() {
    this.child1Props = this.props[0]
    this.child2Props = this.props[1]
  }
  update() {
    this.buildProps()
    super.update()
  }
}

class ChildComponent extends Component {
  __html__ = `
    <div>
      {..name}
    </div>
  `
  init() {
    names.push(this.props.name)
    super.init()
  }
}

test("Child's init method can access props declared in parent's init", () => {
  const props = [
    {name: 'alice'},
    {name: 'elsa'}
  ]
  const div = load(ParentComponent, props)
  expect(names).toEqual(['alice', 'elsa'])
})

test("Child's props to be updated", () => {
  const props = [
    {name: 'alice'},
    {name: 'elsa'}
  ]
  const div = load(ParentComponent, props)
  expect(div).toShow(`
    <div>
      <div>alice</div>
      <div>elsa</div>
    </div>
  `)
  props.length = 0
  props.push({name: 'dylan'})
  props.push({name: 'thomas'})
  div.update()
  expect(div).toShow(`
    <div>
      <div>dylan</div>
      <div>thomas</div>
    </div>
  `)
})