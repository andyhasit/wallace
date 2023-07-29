import {c, load, Component} from '../utils'


function setSpan(n, w) {
  w.text(n.toUpperCase()).css('alert')
}

class TestComponent extends Component {
  __html__ = `
    <div>
      <span :watch="..name|setSpan(n,w)"></span>
    </div>
  `
}

const props = {name: 'joe'}

test('Watch with no target updates element', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span class="alert">JOE</span>
    </div>
  `)
})
