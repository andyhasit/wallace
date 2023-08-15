import {load, Component} from '../utils'


const Li1 = <li class="1">{p}</li>
const Li2 = <li class="2">{p}</li>

const List =
  <ul>
    <this.li _for={p}/>
  </ul>

List.prototype.li = Li1


const ListSubclass = Component.define({
  _base: List
})
ListSubclass.prototype.li = Li2


test('Page uses Footer1', () => {
  const div = load(List, [1, 2, 3])
  expect(div).toShow(`
    <ul>
      <li class="1">1</li>
      <li class="1">2</li>
      <li class="1">3</li>
    </ul>
  `)
})


test('PageSubclass uses Footer2', () => {
  const div = load(ListSubclass,  [4, 5, 6])
  expect(div).toShow(`
    <ul>
      <li class="2">4</li>
      <li class="2">5</li>
      <li class="2">6</li>
    </ul>
  `)
})