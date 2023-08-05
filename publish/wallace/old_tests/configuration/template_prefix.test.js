/*
This test ensures we can have a tag in front of a html templated string,
which some html-in-es6 syntax highlighters require to work.
*/

import {c, h, load, Component} from '../utils'

class TestComponent1 extends Component {
  __html__ = `<div>Hello</div>`
}

class TestComponent2 extends Component {
  __html__ = html`<div>Hello</div>`
}

class TestComponent3 extends Component {
  __html__ = '<div>Hello</div>'
}


test('Prefix is ignored', () => {
  let div = load(TestComponent1)
  expect(div).toShow(`<div>Hello</div>`)
  div = load(TestComponent2)
  expect(div).toShow(`<div>Hello</div>`)
  div = load(TestComponent3)
  expect(div).toShow(`<div>Hello</div>`)
})