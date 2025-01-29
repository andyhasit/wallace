//@14 error TS2345: Argument of type 'number' is not assignable to parameter of type 'string | HTMLElement'.
import { mount, Accepts } from "wallace";

const MyComponent: Accepts<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const c = 6;
mount("str", MyComponent);
mount(document.getElementById("a"), MyComponent);

mount(c, MyComponent);
