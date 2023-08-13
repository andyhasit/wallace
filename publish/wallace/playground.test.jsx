
// test('---------------------------------', () => {
//     /*
//     Trying ideas for css.
//     */
//     const color = "red"
//     // const MyComponent = <div _style={'danger ' + color}>hello</div>
//     const MyComponent = <div 
//       _toggle:active={clicked ? 'red': 'black'}
//       w-toggle:danger={clicked ? 'red': 'black'}
//       toggle-danger={6}
//       toggle_={6}
//       >hello</div>
//     const div = load(MyComponent)
//     expect(div).toShow(`<div class="red">hello</div>`)
//   })






const foo = 9
// const MyComponent = <div class="{foo} bar">hello</div>
const MyComponent2 = <div class={foo + " bar"}>{p}</div>


// const seconds = 9

// const StopWatch = html`
//   <div>
//     <style>
//       .body {
//         color: #ff0000;
        
//       }  
//     </style>
//     <h2>Stopwatch</h2>
//     <a href="" style="color: red"></a>
//     <span>Time: {seconds}</span>
//   </div>
// `