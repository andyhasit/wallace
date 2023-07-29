const btnClicked = () => {
  count += 1
  root.update()
}

const a = <div class="mt-2">
  <button class="mt-2 bg-blue-500 text-white" _onClick={btnClicked()}>Click me</button>
</div>


class Counter extends Component(
  html = <div>
    <span>{count}</span>
    <button _onClick={c.btnClicked()}>Click me</button>
  </div>,
  btnClicked = () => {
    count += 1
    root.update()
  }
)


// const ClickCounter = Component.__ex__(html`
//   <div>
//     <button class="mt-2 bg-blue-500 text-white" :onClick="btnClick(c, p)">Click me</button>
//     <br><br>
//     <div>Clicked {..clicks} times.</div>
//   </div>
// `)


// const ClickCounter2 = Component._((c) => 
//   <div>
//     <button class="mt-2 bg-blue-500 text-white" _onClick="btnClick(c, p)">
//       Click me
//     </button>
//     <div>Clicked {c.clicks} times.</div>
//     <br/><br/>
//   </div>
// )

