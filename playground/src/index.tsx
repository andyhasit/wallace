import { mount, Accepts, extendPrototype } from "wallace";

interface Counter {
  clicks: number;
}

const ClickCounter: Accepts<Counter> = (counter, _component) => (
  <div>
    <button onClick={_component.click(counter)}>
      <span>Click me</span>
    </button>
    <a> Clicked {counter.clicks} times</a>
    <stub:__foo__ ref:bar />
  </div>
);

ClickCounter.prototype.click = function (counter: Counter) {
  counter.clicks += 1;
  console.log(this.ref);
  this.update();
};

ClickCounter.prototype.__foo__ = (counter: Counter, _component) => (
  <div>
    hello {counter.clicks}
    <button style={"color: red"} onClick={_component.parent.click(counter)}>
      <span>Click me</span>
    </button>
  </div>
);

// const SpecialCounter: Accepts<Counter> = extendPrototype(ClickCounter);
const SpecialCounter = extendPrototype(ClickCounter);

SpecialCounter.prototype.__foo__ = (counter: Counter, _component) => (
  <div>
    hello {counter.clicks}
    <button style={"color: green"} onClick={_component.parent.click(counter)}>
      <span>Click me</span>
    </button>
  </div>
);

const Foo = (counter: Counter, _component) => (
  <div>
    <SpecialCounter.nest props={counter} />
  </div>
);
// const ClickCounter: Accepts<Counter> = (counter) => (
//   <div>
//     <stub:foo />
//     <a> Clicked {counter.clicks} times</a>
//   </div>
// );

window.cmp = mount("main", SpecialCounter, { clicks: 0 });
