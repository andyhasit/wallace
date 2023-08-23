import {Component, mount} from 'wallace'

const btnClick = (c: Component, p: Prop) => {
  p.clicks += 1
  c.update()
}


interface Prop {
  name: string,
  clicks: number
}

// See: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts
// And: https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
    div: any;
  }
}


const TestComponent = (p:Prop) => {
  <div id="test">
    <span>hello {p.name}</span>
    <span _show={false}>hide me</span>
  </div>
}

mount(TestComponent, 'app')


// const ClickCounter = Component.__ex__(html`
//   <div>
//     <button :onClick="btnClick(c, p)">Click me</button>
//     <br><br>
//     <div>Clicked {..clicks} times.</div>
//   </div>
// `)


// mount('main', ClickCounter, {clicks: 0})


