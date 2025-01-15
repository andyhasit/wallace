import { mount, Accepts } from "wallace";

interface Counter {
  clicks: number;
}

const ClickCounter: Accepts<Counter> = (counter, _component) => (
  <div>
    <button onClick={_component.click(counter)}>Click me</button>
    <div>Clicked {counter.clicks} times</div>
  </div>
);

ClickCounter.prototype.click = function (counter: Counter) {
  counter.clicks += 1;
  this.update();
};

mount("main", ClickCounter, { clicks: 0 });
