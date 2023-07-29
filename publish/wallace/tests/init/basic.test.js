import {load, Component} from '../utils'

const data = {}

class TestComponent extends Component {
  __html__ = `
    <div>
    </div>
  `
  init() {
    data.name = this.props.name
  }
}

test('Init method can access props', () => {
  load(TestComponent, {name: 'tim'})
  expect(data.name).toEqual('tim')
})
