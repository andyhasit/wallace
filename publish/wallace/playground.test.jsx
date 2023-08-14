
const x = 10

const Child = <span>{x}</span>

const items = [1, 4, 6]

const MyComponent2 = 
  <div>
    <h1>Hello</h1>
    <Child _for={items}/>
  </div>

//<this.foo _props={{foo: 'bar'}}/>