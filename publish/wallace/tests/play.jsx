import {mount} from 'wallace'


const ff = () => {false}

// ff()
const Foo =
  <span>yo</span>


const TestComponent =
  <div id="test">
    <Foo/>
  </div>


mount(TestComponent)