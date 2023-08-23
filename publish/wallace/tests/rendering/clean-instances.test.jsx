import {load} from '../utils'


const TestComponent =
  <div>
    <div>{p.title}</div>
    <span>{p.content}</span>
    <span>{p.footer}</span>
  </div>


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
