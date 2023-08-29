import {mount} from 'wallace'




const createProxy = (target, component) => {
  const handler = {
    get(target, key) {
      if (key == 'isProxy')
        return true;

      const prop = target[key];

      // return if property not found
      if (typeof prop == 'undefined')
        return;

      // set value as proxy if object
      if (!prop.isProxy && typeof prop === 'object')
        target[key] = new Proxy(prop, handler);

      return target[key];
    },
    set(target, key, value) {
      console.log('Setting', target, `.${key} to equal`, value);

      // todo : change to component
      target[key] = value;
      component.update()
      return true;
    }
  }
  return new Proxy(target, handler);
}


const getTotal = (counters) => counters.reduce((partialSum, counter) => partialSum + counter.clicks, 0)


const ClickCounter =
  <div>
    <span>{p.clicks}</span>
    <button on:click={p.clicks += 1}>+</button>
    <input bind:blur={p.clicks|parseInt(w.getValue())}/>
  </div>


// const Base = <div></div>
const App = 
  <div>
    <span>Total: {getTotal(p)}</span>
    <button on:click={p.push({clicks: 0})}>Add</button>
    <div>
      <ClickCounter repeat={p} />
    </div>
    <span rand></span>
  </div>


App.prototype.onInit = function() {
  this.props = createProxy(this.props, this)
}

// ClickCounter.prototype.update = function() {
//   // setTimeout(() => {
//   //   Component.prototype.update.apply(this)
//   // }, 1000)

//   if (this.props.clicks > 5) {
//     this.props.clicks = 0
//   }
//   // console.log(this.props.count)
//   Component.prototype.update.apply(this)
// }

// ClickCounter.prototype.onInit = function() {
//   this.props = createProxy(this.props, this)
// }



const mainProps =  [
  {clicks: 3},
  {clicks: 5},
  {clicks: 6},
]

mount("main", App, mainProps)



// function useState(initialValues) {

//   var state = {}
//   Object.assign(state, initialValues)

//   return new Proxy(state, {
//     set: function(obj, prop, value) {
//       obj[prop] = value
//       c.update()
//       return true
//   }})
// }


// const s = useState({count: 0});



/*

Better like this:

Can I proxy a whole scope?

*/
// const MyComponent = (counter) => {
//   /*
//   Stuff here is magic. 
//     Functions become prototype methods?
//     Can set options.
//   */
//   const foo = 9
//   return <div>
//     <div>{counter.clicks}</div>
//     <button on:click={counter.clicks += 1}>+</button>
//   </div>
// }

/*

Maybe the way to do it is to make the props reactive. 

On setProps, the props are transformed into a fully nested proxy (assuming that works)
which means that any changes made by nested components will update the root component.


import {mount} from 'gleekit'

const ClickCounter (clicks) => {
  <div reactive>
    <div>{clicks.count}</div>
    <button on:click={clicks.count += 1}>+</button>
  </div>

mount("main", ClickCounter, {clicks: 0})

*/

// function makeProxy(initialValues) {

//   var state = {}
//   Object.assign(state, initialValues)

//   return new Proxy(state, {
//     set: function(obj, prop, value) {
//       obj[prop] = value
//       c.update()
//       return true
//   }})
// }





const toCss = (n) => n > 3 ? 'red' : 'green'

// const ClickCounter =
//   <div>
//     <div className={p.clicks|toCss(n)}>Click count: {p.clicks}</div>
//     <button on:click={btnClick(c, p)}>UP</button>
//     <button on:click={makeRed(c, p)}>Red</button>
//     <button on:click={makeGreen(c, p)}>Green</button>
//     <button disabled>A</button>
//     <input type="checkbox" checked={p.clicks|n > 3}/>
//   </div>


// <button style="color: red;">A</button>
// <button style:color={color}>A</button>
// <button on:click={btnClick(c, p)}>SET {disabled}</button>
// <button disabled>B</button>
// <button disabled={!disabled}>C</button>

// const app = mount('main', ClickCounter, {clicks: 0})

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



const increment = (c, p) => {
  p.clicks += 1
  c.update()
}
