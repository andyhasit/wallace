import {mount} from 'wallace'

const color = 'red'
const btnClick = (c, p) => {
  p.clicks += 1
  // disabled = !disabled
  c.update()
}

let disabled = false

const makeRed = (c, p) => {
  p.css = 'red'
  c.update()
}

const makeGreen = (c, p) => {
  p.css = 'green'
  c.update()
}

const toCss = (n) => n > 3 ? 'red' : 'green'

const ClickCounter =
  <div>
    <div className={p.clicks|toCss(n)}>Click count: {p.clicks}</div>
    <button on:click={btnClick(c, p)}>UP</button>
    <button on:click={makeRed(c, p)}>Red</button>
    <button on:click={makeGreen(c, p)}>Green</button>
    <button disabled>A</button>
    <input type="checkbox" checked={p.clicks|n > 3}/>
  </div>


// <button style="color: red;">A</button>
// <button style:color={color}>A</button>
// <button on:click={btnClick(c, p)}>SET {disabled}</button>
// <button disabled>B</button>
// <button disabled={!disabled}>C</button>

const app = mount('main', ClickCounter, {clicks: 0})

  // <div>
  //   <button _style:color={color} _on:Click={btnClick(c, p)}>Click me</button>
  //   <br/>
  //   <div>Clicked {p.clicks} times</div>
  //   <button _on:Click={toggle(c)}>Toggle</button>
  //   <input _checked={c.active} type="checkbox"/>
  //   <span _hide={!c.active}>FFF</span>
  // </div>

// _att:visible={p.clicks > 0}


// mount(document.getElementsByTagName('h1')[0], ClickCounter, {clicks: 0})
// let ticks = 0

// const StopWatch =
//   <div>
//     <h2>Stopwatch</h2>
//     <span>{ticks}s</span>
//     <button >Stop {ticks}</button>
//   </div>



// const interval = setInterval(() => {
//   ticks += 1;
//   stopwatch.update()
// }, 1000)


// const toggle = (c) => {
//   c.active = !c.active
//   c.update()
// }

// const toPx = (n) => `${n}px`
// let width = 290
// const color = 'green'

// const allCaps = (c, n) => n.toUpperCase()

// let hhh = false

// const change = (c) => {
//   hhh = !hhh
//   c.update()
// }
