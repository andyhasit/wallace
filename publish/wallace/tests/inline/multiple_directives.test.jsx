import {load} from '../utils'


const Foo =
  <div>
    The book {p.title} was written by {p.author|allCaps(c, n)}
  </div>


const allCaps = (c, n) => n.toUpperCase()
const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes'}

test('Can have multiple inlines in text', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div>The book
      <text>Flowers for Algernon</text>was written by
      <text>DANIEL KEYES</text>
    </div>
  `)
})