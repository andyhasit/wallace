///////////////////////////
///////////////////////////
///////////////////////////
import {h, mount} from 'wallace'

// const { Component } = require("../src/component")

// foo(8)
// const MyComponent = Component.define(<div class="foo"><span>yo</span>hello</div>, 8)

// // implicitly extends from Component, which will be imported
// const Simple =
//  <div class="foo"><span>yo</span>hello</div>

// // if you want to extend from another:

// const Custom = {
//   html: <div class="foo"><span>yo</span>hello</div>,
//   base: AnotherComponent,
// }

// const StopWatch = { 
//     html: 
//     <div>
//       <h2>Stopwatch</h2>
//       <span>{seconds}</span>
//     </div>
//   }

// const X = ww.define(<div class="foo"><span>yo</span>hello</div>, 8)
// const Y = {
    //     html: <div class="foo"><span>yo</span>hello</div>
// }

// class Foo extends Component {
//     // constructor(path, baseClass, componentName) {
//     //     this.path = path
//     //     this.baseClass = baseClass
//     //     this.componentName = componentName
//     //     this.statements = []
//     //     this.newArgs = [t.identifier(this.baseClass)]
//     //     this.transform()
//     //   }
//     html = <div class="foo"><span>yo</span>hello</div>
// }


// const X = 
//     <div class="foo" style="xxx">
//         a = 2
//         Hey <span>YOU</span> hello {timmy|foo(n)} yay
//     </div>

const TestComponent =
  <div id="test">
    <span>hello {p.name}</span>
    <span>{service.name}</span>
    <span _show={show}>hide me</span>
  </div>
