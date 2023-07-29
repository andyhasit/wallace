import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span :="..height||@height"></span>
      <span :watch="..color||style:color"></span>
    </div>
  `
}

const props = {
  height: '100px',
  color: 'green'
}

test('Basic watch updates text', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span height="100px"></span>
      <span style="color: green;"></span>
    </div>
  `)
})
