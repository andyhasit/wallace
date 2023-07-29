import {c, h, load, Component} from '../utils'

const data = {
  clicks: 0
}

let args = undefined

class TestComponent extends Component {
  __html__ = `
    <div>
      <button :el="btn" :onClick="clicked(w, e, p, c)">Go</button>
    </div>
  `
}

const clicked = (w, e, p, c) => {
  p.clicks ++
  args = {w, e, p, c}
}

test('On click event works', () => {
  const div = load(TestComponent, data)
  const btn = div.el.childNodes[0]
  btn.click()
  expect(data.clicks).toEqual(1)
  expect(args.w).toEqual(div.component.el.btn)
  expect(args.p).toEqual(data)
  expect(args.c).toEqual(div.component)
  const newData = {
    clicks: 10
  }
  // Ensure new props are used
  div.component.setProps(newData)
  btn.click()
  expect(data.clicks).toEqual(1)
  expect(newData.clicks).toEqual(11)
})
