import {Component, mount} from 'wallace'

const btnClick = (c, p) => {
  p.clicks += 1
  c.update()
}

const x = <div></div>


// const ClickCounter = Component.__ex__(html`
//   <div>
//     <button :onClick="btnClick(c, p)">Click me</button>
//     <br><br>
//     <div>Clicked {..clicks} times.</div>
//   </div>
// `)


// mount('main', ClickCounter, {clicks: 0})