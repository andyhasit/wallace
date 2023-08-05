import {c, load, Component} from '../utils'


class TestComponent1 extends Component {
  __html__ = '<span class="  {..style} "></span>'
}
test('Start and end spacing are stripped', () => {
  const div = load(TestComponent1, {style: 'danger'})
  expect(div).toShow('<span class="danger"></span>')
})


class TestComponent2 extends Component {
  __html__ = '<span class="span-{..style}"></span>'
}
test('No space added before if there is none', () => {
  const div = load(TestComponent2, {style: 'danger'})
  expect(div).toShow('<span class="span-danger"></span>')
})


class TestComponent3 extends Component {
  __html__ = '<span class="span {..style}  "></span>'
}
test('Space before is preserved if there is any', () => {
  const div = load(TestComponent3, {style: 'danger'})
  expect(div).toShow('<span class="span danger"></span>')
})


class TestComponent4 extends Component {
  __html__ = '<span class=" {..style} special "></span>'
}
test('Space after is preserved if there is any', () => {
  const div = load(TestComponent4, {style: 'danger'})
  expect(div).toShow('<span class="danger special"></span>')
})


class TestComponent5 extends Component {
  __html__ = '<span class="{..style}-special"></span>'
}
test('No space added after if there is none', () => {
  const div = load(TestComponent5, {style: 'danger'})
  expect(div).toShow('<span class="danger-special"></span>')
})