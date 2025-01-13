import { mount, Accepts, Component } from "gleekit";

interface Counter {
  clicks: number;
}

const ClickCounter: Accepts<Counter> = (counter) => (
  <div>
    <button onClick={ctrl.click(counter)}>
      <span>Click me</span>
    </button>
    <a> Clicked {counter.clicks} times</a>
  </div>
);

ClickCounter.prototype.click = function (counter: Counter) {
  counter.clicks += 1;
  this.update();
};

ClickCounter.methods({
  click: function (counter: Counter) {
    counter.clicks += 1;
    this.root.update();
  },
});

// const CounterList: Accepts<null> = () => (
//   <div>
//     <button onClick={ctrl.addCounter()}>Add</button>
//     <div>
//       <ClickCounter.repeat props={ctrl.counters} />
//     </div>
//   </div>
// );

class CounterList extends Component<null> {
  jsx() {
    return (
      <div>
        <button onClick={ctrl.addCounter()}>Add</button>
        <div>
          <ClickCounter.repeat props={[3]} />
        </div>
      </div>
    );
  }
}

const ctrl = {
  root: undefined,
  counters: [],
  addCounter: function () {
    this.counters.push({ clicks: 0 });
    this.root.update();
  },
  click: function (counter: Counter) {
    counter.clicks += 1;
    this.root.update();
  },
};

ctrl.root = mount("main", CounterList, ctrl);
