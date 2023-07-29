import {load, Component} from '../utils'

class BaseModal extends Component {
  __html__ = `
    <div>
      <div>{..title}</div>
      <stub:inner />
    </div>
  `
}

class Item extends Component {
  __html__ = `<li>{.props}</li>`
}

class CustomModal extends BaseModal {
  __stubs__ = {
    inner: html`<ul :use="Item" :items=".items()"></ul>`
  }
  items() {
    return ['a', 'b']
  }
}

test("CustomModal uses parent methods", () => {
  const div = load(CustomModal, {title: 'Letters', content: 'Really?'})
  expect(div).toShow(`
    <div>
      <div>Letters</div>
      <ul>
        <li>a</li>
        <li>b</li>
      </ul>
    </div>
  `)
})
