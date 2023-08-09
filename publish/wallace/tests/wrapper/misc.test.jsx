import {load, define} from '../utils'

const TestComponent = define({
  afterInit() {
    console.log(this)
    this.el.label.text('Name:').css('bold')
    this.el.nameInput.value('Bob')
    this.el.test.text(this.el.nameInput.getValue())
    }
  },
  <div>
    <span _el="label"></span>
    <input _el="nameInput"/>
    <span _el="test"></span>
  </div>   
)


test('Misc wrapper properties', () => {
  const div = load(TestComponent)
  expect(div).toShow(`
  <div>
    <span class="bold">Name:</span>
    <input>
    <span>Bob</span>
  </div>
  `)
})