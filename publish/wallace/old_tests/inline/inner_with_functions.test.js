import {c, load, Component} from '../utils'


const props = {
  getName: function() {
    return 'bob'
  }
}

function getName() {
  return 'joe'
}

const service = {
  name: 'jane',
  getName: function() {
    return this.name
  }
}


class TestComponent extends Component {
  __html__ = `
    <div>
      <span>{..getName()}</span>
      <span>{.getName()}</span>
      <span>{getName()}</span>
      <span>{service.getName()}</span>
    </div>
  `
  init() {
    this.name = 'lisa'
  }
  getName() {
    return this.name
  }
}


test('Inline functions called on load', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span>bob</span>
      <span>lisa</span>
      <span>joe</span>
      <span>jane</span>
    </div>
  `)
})

test('Inline functions called on update', () => {
  const div = load(TestComponent, props)
  div.component.name = 'alice'
  service.name = 'jana'
  div.update()
  expect(div).toShow(`
    <div>
      <span>bob</span>
      <span>alice</span>
      <span>joe</span>
      <span>jana</span>
    </div>
  `)
})