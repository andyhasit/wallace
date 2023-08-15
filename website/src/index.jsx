import {mount} from 'wallace'

const btnClick = (c, p) => {
  p.clicks += 1
  c.update()
}

// const ClickCounter = 
//   <div>
//     <button _on:Click={btnClick(c, p)}>Click me</button>
//     <br/>
//     <div _att:visible={p.clicks > 0}>Clicked {p.clicks} times!</div>
//   </div>


// let ticks = 0

// const StopWatch =
//   <div>
//     <h2>Stopwatch</h2>
//     <span>{ticks}s</span>

//     <button >Stop {ticks}</button>
//   </div>


// const stopwatch = mount('main', StopWatch, {clicks: 0})

// const interval = setInterval(() => {
//   ticks += 1;
//   stopwatch.update()
// }, 1000)

