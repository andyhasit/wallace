//@16 error TS2741: Property 'props' is missing in type '{}' but required in type '{ props: Props[]; showIf?: boolean; }'.
import { mount, Accepts } from "wallace";

interface Props {
  clicks: number;
}

const ClickCounter: Accepts<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const CounterList = (
  <div>
    <ClickCounter.repeat />
  </div>
);

mount("main", CounterList);
