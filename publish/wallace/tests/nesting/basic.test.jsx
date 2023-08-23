import {load, Component} from '../utils'

const data = {}

const TestComponent = Component.extend({
  onInit() {
    data.name = this.props.name
  }
  },
  <div></div>
)

test('Init method can access props', () => {
  load(TestComponent, {name: 'tim'})
  expect(data.name).toEqual('tim')
})
