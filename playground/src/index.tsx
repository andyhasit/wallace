import { mount, Accepts, createProxy } from "wallace";

interface Counter {
  clicks: number;
  text: string;
  checked: boolean;
}

const ClickCounter: Accepts<Counter> = (counter) => (
  <div>
    <button onClick={counter.clicks++}>Click me</button>
    <span>Clicked {counter.clicks} times</span>

    <input bind:keyup={counter.text} type="text"></input>
    <input checked={counter.checked} type="checkbox"></input>
  </div>
);

// ClickCounter.prototype.click = function (counter: Counter) {
//   counter.clicks += 1;
//   this.update();
// };

const getTotalClicks = (counters: Counter[]) =>
  counters.reduce((partialSum, counter) => partialSum + counter.clicks, 0);

const getTotalChecked = (counters: Counter[]) =>
  counters
    .filter((c) => c.checked)
    .reduce((partialSum, counter) => partialSum + counter.clicks, 0);

const cat = (counters: Counter[]) =>
  counters.reduce((i, counter) => i + counter.text, "");

const ClickCounters: Accepts<Counter[]> = (counters) => (
  <div>
    <div>
      Total: {getTotalChecked(counters)}/{counters.length} {cat(counters)}
    </div>
    <button onClick={counters.push({ clicks: 0, text: "", checked: true })}>
      Add
    </button>
    <div>
      <ClickCounter.repeat props={counters} />
    </div>
  </div>
);

// <form>
// <input type="number"></input>
// <input type="date"></input>
// <input type="text"></input>
// </form>

ClickCounters.prototype.setProps = function (props: Counter[]) {
  this.props = createProxy(props, this);
  this.update();
};

mount("main", ClickCounters, [{ clicks: 0, text: "aaa", checked: false }]);
// mount("main", ClickCounters, [{ clicks: 0 }]);
