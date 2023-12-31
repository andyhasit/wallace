import {load} from '../utils'


const Foo =
  <div>
    Title: {p.title} <a href="#more">Read more</a> Written by {p.author}
  </div>


const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes'}

test('Can have inlines in non-leaf nodes', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div>
    Title: 
      <text>Flowers for Algernon</text>
      <a href="#more">Read more</a>
      Written by <text>Daniel Keyes</text>
    </div>
  `)
})