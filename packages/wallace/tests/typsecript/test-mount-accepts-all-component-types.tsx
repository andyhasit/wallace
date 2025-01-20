import { mount, Accepts } from "wallace";

interface Props {
  clicks: number;
}

const FunctionWithoutProps: Accepts<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const FunctionWithProps: Accepts<Props> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

mount("a", FunctionWithoutProps);
mount("b", FunctionWithProps);
