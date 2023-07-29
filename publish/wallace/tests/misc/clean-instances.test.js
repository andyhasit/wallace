import {load, Component} from '../utils'


class TestComponent extends Component {
  __html__ = `
    <div>
      <div>{..title}</div>
      <span>{..content}</span>
      <span>{..footer}</span>
    </div>
  `
}


test("Second instance of component works", () => {
  let div = load(TestComponent, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)

  // We must do this a second time to test a regression bug

  div = load(TestComponent, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)
})
