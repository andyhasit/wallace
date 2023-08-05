import {load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = html`
    <div>
      The book {..title} was written by {..author|allCaps(c, n)}
    </div>
  `
  
}

const allCaps = (c, n) => n.toUpperCase()
const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes'}

test('Can have multiple inlines in text', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
    The book Flowers for Algernon was written by DANIEL KEYES
    </div>
  `)
})