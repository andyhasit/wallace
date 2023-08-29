import {load} from '../utils'

const TestComponent =
  <div>
    <div show={p.show}>
      <div el:msg>{A|p.message}</div>
    </div>
  </div>


const props = {
  show: true,
  message: 'hello'
}


test("The :show directive stops shielded elements from updating.", () => {
  const div = load(TestComponent, props)

  // Run some sanity checks first...
  expect(div).toShow(`
    <div>
      <div>
        <div>hello</div>
      </div>
    </div>
  `)
  expect(div.component.el.msg.e.hidden).toBe(false)
  props.show = false
  div.update()
  expect(div).toShow(`
    <div>
      <div hidden="">
        <div>hello</div>
      </div>
    </div>
  `)

  expect(div.component.el.msg.e.hidden).toBe(false)

  // Now check that the shielded element is not updated if show is false.
  props.show = false
  props.message = 'goodbye'
  div.update()
  expect(div).toShow(`
    <div>
      <div hidden="">
        <div>hello</div>
      </div>
    </div>
  `)

  expect(div.component.el.msg.e.hidden).toBe(false)
  // Now check that the shielded element did update.
  props.show = true
  div.update()
  expect(div).toShow(`
    <div>
      <div>
        <div>goodbye</div>
      </div>
    </div>
  `)
  expect(div.component.el.msg.e.hidden).toBe(false)
})
