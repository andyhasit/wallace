import {load, Component} from '../utils'


class BaseModal extends Component {
  __html__ = `
    <div>
      <div>{..title}</div>
      <stub:inner />
      <stub:footer />
    </div>
  `
  __stubs__ = {
    footer: `<span>{..footer}</span>`
  }
}


class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span>{..content}</span>`
  }
}

test("Component can use stubs defined in parent", () => {
  let div = load(CustomModal, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)

  // We must do this a second time to test a regression bug

  div = load(CustomModal, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)
})
