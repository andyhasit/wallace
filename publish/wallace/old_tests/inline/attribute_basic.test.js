import {c, load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <span class="{..style}"></span>
      <span class="{.style}"></span>
      <span class="{service.style}"></span>
    </div>
  `
  init() {
    this.style = 'warning'
  }
}

const props = {style: 'alert'}
const service = {style: 'danger'}

test('Attributes display correct initial values', () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <span class="alert"></span>
      <span class="warning"></span>
      <span class="danger"></span>
    </div>
  `)
})

test('Attributes update when service changed', () => {
  const div = load(TestComponent, props)
  service.style = 'ok'
  div.update()
  expect(div).toShow(`
    <div>
      <span class="alert"></span>
      <span class="warning"></span>
      <span class="ok"></span>
    </div>
  `)
})

test('Attributes update when props changed', () => {
  const div = load(TestComponent, props)
  props.style = 'boo'
  div.update()
  expect(div).toShow(`
    <div>
      <span class="boo"></span>
      <span class="warning"></span>
      <span class="ok"></span>
    </div>
  `)
})

test('Attributes update when new props passed', () => {
  const div = load(TestComponent, props)
  div.setProps({style: 'different'})
  expect(div).toShow(`
    <div>
      <span class="different"></span>
      <span class="warning"></span>
      <span class="ok"></span>
    </div>
  `)
})