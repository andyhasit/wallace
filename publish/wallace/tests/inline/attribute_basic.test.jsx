import {load} from '../utils'


const Foo =
  <div>
    <span className={p.style}></span>
    <span className={c.style}></span>
    <span className={service.style}></span>
  </div>

Foo.prototype.init = function() {
  this.style = 'warning'
}


const props = {style: 'alert'}
const service = {style: 'danger'}

test('Attributes display correct initial values', () => {
  const div = load(Foo, props)
  expect(div).toShow(`
    <div>
      <span class="alert"></span>
      <span class="warning"></span>
      <span class="danger"></span>
    </div>
  `)
})

test('Attributes update when service changed', () => {
  const div = load(Foo, props)
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
  const div = load(Foo, props)
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
  const div = load(Foo, props)
  div.setProps({style: 'different'})
  expect(div).toShow(`
    <div>
      <span class="different"></span>
      <span class="warning"></span>
      <span class="ok"></span>
    </div>
  `)
})