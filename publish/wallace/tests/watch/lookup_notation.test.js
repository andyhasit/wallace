import {c, load, Component} from '../utils'


function getName() {
  return 'alice'
}

class TestComponent extends Component {
  __html__ = `
    <div>
      <span :watch="..name||text"></span>
      <span :watch=".name||text"></span>
      <span :watch="getName()||text"></span>
    </div>
  `
  init() {
    this.name = 'bob'
  }
}

const props = {name: 'joe'}

test('Lookup notation selects correct reference', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span>joe</span>
      <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
