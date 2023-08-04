import {Component, mount} from 'wallace'

const btnClick = (c, p) => {
  p.clicks += 1
  c.update()
}

const ClickCounter = 
  <div>
    <button _onClick={btnClick(c, p)}>Click me</button>
    <br/><br/>
    <div>Clicked {p.clicks} times!</div>
  </div>


let ticks = 0
const div = document.getElementById('main')

const StopWatch = 
  <div>
    <h2>Stopwatch</h2>
    <span>{ticks| Math.round(n / 10)}:{ticks}</span>
  </div>


const stopwatch = mount('main', StopWatch, {clicks: 0})

const interval = setInterval(() => {
  ticks += 1;
  stopwatch.update()
}, 100)