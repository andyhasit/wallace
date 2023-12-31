import {h, load, Component} from '../utils'

const TestComponent = Component.extend({
  getContents() {
    return this.props.items.map(i => h('div').inner(i))
  }},
  <div>
    <div hidden={p.hide} call:inner={A|c.getContents()}>
    </div>
  </div>
)

const props = {
  hide: false,
  items: [1, 2, 3]
}


test("Hide masks", () => {
  const div = load(TestComponent, props)
  expect(div).toShow(`
    <div>
      <div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)
  props.hide = true
  div.update()
  expect(div).toShow(`
    <div>
      <div class="hidden">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)
  props.items = [4, 5]
  div.update()

  // Nothing should change
  expect(div).toShow(`
    <div>
      <div class="hidden">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)

  props.hide = false
  div.update()
  //
  expect(div).toShow(`
    <div>
      <div class="">
        <div>4</div>
        <div>5</div>
      </div>
    </div>
  `)
})
