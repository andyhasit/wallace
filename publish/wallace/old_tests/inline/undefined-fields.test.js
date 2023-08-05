import {load, Component} from '../utils'

const person = {name: undefined}

const ComponentWithOwnProps = Component.__ex__(html`
  <div>
    <div>{person.name}<br>yolo</div>
  </div>
`)

test("Undefined values start empty then populate with data", () => {
  const div = load(ComponentWithOwnProps)

  expect(div).toShow(`
    <div>
      <div><br>yolo</div>
    </div>
  `)
  
  person.name = 'jo'
  div.update()
  expect(div).toShow(`
    <div>
      <div>jo<br>yolo</div>
    </div>
  `)

  person.name = undefined
  div.update()
  expect(div).toShow(`
    <div>
      <div><br>yolo</div>
    </div>
  `)

  person.name = 'jane'
  div.update()
  expect(div).toShow(`
    <div>
      <div>jane<br>yolo</div>
    </div>
  `)
  
})