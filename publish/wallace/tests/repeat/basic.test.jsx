import {load} from '../utils'

const items = [6, 2, 4]

const Child = <span>{p}</span>

const Parent = 
  <div>
    <h1>Hello</h1>
    <div>
      <Child repeat={items}/>
    </div>
  </div>


test('Repeat works', () => {
  const div = load(Parent)
  expect(div).toShow(`
  <div>
    <h1>Hello</h1>
    <div>
      <span>6</span>
      <span>2</span>
      <span>4</span>
    </div>
  </div>
  `)
})