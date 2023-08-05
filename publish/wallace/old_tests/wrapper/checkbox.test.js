import {load, Component} from '../utils'


const TestComponent = Component.__ex__(html`
  <div>
    <input :el="checkbox" type="checkbox">
    <span :el="span">{c.el.checkbox.e.checked}</span>
  </div>
`)

// TODO: figure out how to simulate click/change

// test('isChecked reads correctly', () => {

//   const div = load(TestComponent)
//   const component = div.component
//   const checkboxElement = component.el.checkbox.e

//   expect(div).toShow(`
//     <div>
//       <input type="checkbox">
//       <span>false</span>
//     </div>
//   `)
//   checkboxElement.change = true
//   //component.update()
//   console.log(checkboxElement.checked)
//   expect(div).toShow(`
//     <div>
//       <input type="checkbox">
//       <span>true</span>
//     </div>
//   `)
// })


const TestComponent2 = Component.__ex__(html`
  <div>
    <input :el="checkbox" type="checkbox" :checked=".done">
    <span :el="span">{c.el.checkbox.isChecked()}</span>
  </div>
`)


test('Checked directive obeys', () => {

  const div = load(TestComponent2)
  const component = div.component

  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>false</span>
    </div>
  `)

  component.done = true
  component.update()
  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>true</span>
    </div>
  `)

  component.done = false
  component.update()
  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>false</span>
    </div>
  `)
})