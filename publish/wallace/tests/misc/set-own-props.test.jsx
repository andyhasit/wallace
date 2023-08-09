import {load, define} from '../utils'

const ComponentWithOwnProps = define({
  afterInit() {
    this.props = {name: 'jo'}
  }},
  <div>{p.name}</div>
)

test("Mounted component can create own props", () => {
  const div = load(ComponentWithOwnProps)
  expect(div).toShow(`
    <div>
      jo
    </div>
  `)
})

const Component1 = define(
  <div>
    <ComponentWithOwnProps />
  </div>
)

test("Nested component can create own props", () => {
  const div = load(Component1)
  expect(div).toShow(`
  <div>
    <div>
      jo
    </div>
  </div>
  `)
})
