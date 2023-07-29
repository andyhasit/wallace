import { h } from '../../src/utils'
import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `<div :swap="..choice|mappings|myFallback"></div>`
}


class ComponentA extends Component {
  __html__ = `<span>A</span>`
}

class ComponentB extends Component {
  __html__ = `<span>B</span>`
}

const mappings = {
  a: ComponentA,
  b: ComponentB,
}

const myFallback = k => h('span').text(k)

const props = {choice: 'a'}

test('Swap syntax works', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span>A</span>
    </div>
  `)
  props.choice = 'b'
  div.update()
  expect(div).toShow(`
    <div>
      <span>B</span>
    </div>
  `)
  props.choice = 'yo'
  div.update()
  expect(div).toShow(`
    <div>
      <span>yo</span>
    </div>
  `)
})