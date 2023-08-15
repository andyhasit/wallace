import {h, load} from '../utils'


const Foo =
  <div _swap={p.choice|mappings|myFallback}></div>

const ComponentA =
  <span>A</span>

const ComponentB =
  <span>B</span>


const mappings = {
  a: ComponentA,
  b: ComponentB,
}

const myFallback = k => h('span').text(k)

const props = {choice: 'a'}

test('Swap syntax works', () => {
  const div = load(Foo, props)
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