import { mount, Accepts, Component } from "wallace";

interface Counter {
  clicks: number;
}

const ClickCounter: Accepts<Counter> = (counter) => (
  <div>
    <stub:foo />
    <a> Clicked {counter.clicks} times</a>
  </div>
);
