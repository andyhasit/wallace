import {mount} from 'wallace'

const btnClick = (c, p) => {
  p.clicks += 1
  c.update()
}
const toggle = (c) => {
  c.active = !c.active
  c.update()
}

const allCaps = (c, n) => n.toUpperCase()
const ClickCounter = 
  <div>
    <button _on:Click={btnClick(c, p)}>Click me</button>
    <br/>
    <div>Clicked {p.clicks} times</div>
    <button _on:Click={toggle(c)}>Toggle</button>
    <input _checked={c.active} type="checkbox"/>
    <span _hide={!c.active}>FFF</span>
  </div>

// _att:visible={p.clicks > 0}

const stopwatch = mount('main', ClickCounter, {clicks: 0})
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

