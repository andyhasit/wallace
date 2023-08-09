import {mount, define} from 'wallace'


// const TestComponent = define(
//   <div id="test">
//     <Foo/>
//   </div>
// )

// const methods = {
//   shout: (n) => {
//     console.log(this.name)
//   }
// }

// const SimpleProto = define(
//   // <div id="test">
//   //   <Foo/>
//   // </div>,
//   {
//     base: TestComponent,
//     proto: methods
//   }
// )

// const SimpleProto2 = define({
//     base: SimpleProto,
//     proto: methods
//   },
//   <div id="test">
//     <Foo/>
//   </div>
// )




// SimpleProto2.prototype.bar = () => {
//   this.seconds += 1
// }

// const Foo = component(
//   <span>yo</span>
// )

// const Bar =
//   <span>yo</span>




// const WithStubs = define(
//   {
//     base: SimpleProto,
//     proto: methods
//   },
//   {
//     footer: 
//       <footer>
//         <span>888</span>
//       </footer>,
//     header: 
//       <span></span>
//   },
//   <div id="test">
//     <Foo/>
//   </div>
// )

const WithStubs2 = define(
  // <span></span>,
  {
    foo: <this.partial.footer />
    // footer: 
    //   <footer>
    //     <xxx.foo/>
    //     <span>888</span>
    //   </footer>,
    // header: 
    //   <span></span>
    // , header3: 
    //   <span></span>
  }
)
  
mount(Foo)