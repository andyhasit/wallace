import {load} from '../utils'

const TestComponent =
  <div>
    <div show={p.show}>
      <div call:text={A|p.message}/>
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
  props.show = false
  div.update()
  expect(div).toShow(`
    <div>
      <div class="hidden">
        <div>hello</div>
      </div>
    </div>
  `)

  // Now check that the shielded element is not updated if show is false.
  props.show = false
  props.message = 'goodbye'
  div.update()
  expect(div).toShow(`
    <div>
      <div class="hidden">
        <div>hello</div>
      </div>
    </div>
  `)

  // Now check that the shielded element did update.
  props.show = true
  div.update()
  expect(div).toShow(`
    <div>
      <div class="">
        <div>goodbye</div>
      </div>
    </div>
  `)
})
