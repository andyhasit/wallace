import {c, load, Component, Wrapper} from '../utils'
import {KeyedPool, SequentialPool} from '../../src/index'

class Container extends Component {
  __html__ = '<div :use="Child|id" :items="*|.props"></div>'
}

class Child extends Component {
  __html__ = '<div>{..name}</div>'
}

test('Initial load works', () => {
  const div = load(Container, [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 11, name: 'E'}
  ])
  expect(div).toShow(`
    <div>
      <div>K</div>
      <div>C</div>
      <div>A</div>
      <div>D</div>
      <div>E</div>
    </div>
  `)
})

test('Clear', () => {
  const div = load(Container, [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 11, name: 'E'}
  ])
  div.setProps([])
  expect(div).toShow(`
    <div>
    </div>
  `)
})

test('Add one item to end', () => {
  const props = [
    {id: 30, name: 'A'},
    {id: 62, name: 'Z'},
  ]
  const div = load(Container, props)
  props.push({id: 99, name: 'L'})
  div.update()
  expect(div).toShow(`
    <div>
      <div>A</div>
      <div>Z</div>
      <div>L</div>
    </div>
  `)
})

test('Add item in middle', () => {
  const props = [
    {id: 30, name: 'A'},
    {id: 62, name: 'Z'},
  ]
  const div = load(Container, props)
  div.setProps(
    [
      {id: 30, name: 'A'},
      {id: 99, name: 'L'},
      {id: 62, name: 'Z'},
    ]
  )
  expect(div).toShow(`
    <div>
      <div>A</div>
      <div>L</div>
      <div>Z</div>
    </div>
  `)
})

test('Remove one item from end', () => {
  const props = [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
  ]
  const div = load(Container, props)
  props.splice(3, 1)
  div.update()
  expect(div).toShow(`
    <div>
      <div>K</div>
      <div>C</div>
      <div>A</div>
    </div>
  `)
})

test('Remove one item from middle', () => {
  const props = [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
  ]
  const div = load(Container, props)
  props.splice(1, 1)
  div.update()
  expect(div).toShow(`
    <div>
      <div>K</div>
      <div>A</div>
      <div>D</div>
    </div>
  `)
})

test('Swap items', () => {
  const props = [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 11, name: 'E'}
  ]
  const div = load(Container, props)

  const temp = props[1]
  props[1] = props[3]
  props[3] = temp
  div.update()
  expect(div).toShow(`
    <div>
      <div>K</div>
      <div>D</div>
      <div>A</div>
      <div>C</div>
      <div>E</div>
    </div>
  `)
})


test('Complete replacement', () => {
  const props = [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 11, name: 'E'}
  ]
  const div = load(Container, props)
  div.setProps([
    {id: 111, name: 'M'},
    {id: 23, name: 'N'},
  ])
  expect(div).toShow(`
    <div>
      <div>M</div>
      <div>N</div>
    </div>
  `)
})

test('Multiple add and remove shorter', () => {
  const props = [
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 111, name: 'M'},
    {id: 23, name: 'N'},
    {id: 11, name: 'E'}
  ]
  const div = load(Container, props)
  div.setProps([
    {id: 77, name: 'D'},
    {id: 4, name: 'C'},
    {id: 1220, name: 'I'},
    {id: 11, name: 'E'},
    {id: 542, name: 'J'}
  ])
  expect(div).toShow(`
    <div>
      <div>D</div>
      <div>C</div>
      <div>I</div>
      <div>E</div>
      <div>J</div>
    </div>
  `)
})

test('Multiple add and remove longer', () => {
  const props = [
    {id: 77, name: 'D'},
    {id: 4, name: 'C'},
    {id: 1220, name: 'I'},
    {id: 11, name: 'E'},
    {id: 542, name: 'J'}
  ]
  const div = load(Container, props)
  div.setProps([
    {id: 230, name: 'K'},
    {id: 4, name: 'C'},
    {id: 30, name: 'A'},
    {id: 77, name: 'D'},
    {id: 111, name: 'M'},
    {id: 23, name: 'N'},
    {id: 11, name: 'E'}
  ])
  expect(div).toShow(`
    <div>
      <div>K</div>
      <div>C</div>
      <div>A</div>
      <div>D</div>
      <div>M</div>
      <div>N</div>
      <div>E</div>
    </div>
  `)
})


