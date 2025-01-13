interface DialogProps {
  title: string;
}

// Define the child component with the utility type
const ChildComponent: ComponentWithProps<DialogProps> = ({ title }) => (
  <div>
    <span>{title}</span>
  </div>
);

const ParentComponent: ComponentWithProps<DialogProps> = (props) => (
  <div>
    <ChildComponent props={props} />
  </div>
);

import { mount, Component, ComponentAny, def, cc, CWP } from "wallace";

interface Animal {
  name: string;
}

// class Dialog extends Component<Animal> {
//   jsx = (animal: Animal) => (
//     <div class="dialog">
//       <div>{animal.name}</div>
//       <A props={animal} />
//       <stub:foo />
//       <B props={animal} />
//     </div>
//   );
//   // stubs = () => ({
//   //   foo: <div>{this.props.name}</div>,
//   // });
// }

const A = Component(({ name }: Animal) => <div>{name}</div>);
// const B = ({ name }: Animal) => <div>{name}</div>;

interface DialogProps {
  name: string;
}

// const ChildComponent: CWP<DialogProps> = ({ name }: DialogProps) => (
//   <div>
//     <span>{name}</span>
//   </div>
// );

const CC = () => {
  interface Props {
    name: string;
  }

  return ({ name }: Props) => (
    <div>
      <span>{name}</span>
    </div>
  );
};

const BB = () => {
  <div>
    <CC props={4} />
  </div>;
};
interface GreetingProps {
  message: string;
  name: string;
}

const Greeting = def(({ message, name }: GreetingProps) => (
  <div>
    {name} says {message}
  </div>
));

const ManyGreetings = (greetings: GreetingProps[]) => (
  <div>
    <Greeting props={greetings[0]} />
    <Greeting repeat={greetings} />
  </div>
);

// function ChildComponent({ name }: DialogProps) {
//   <div>
//     <span>{name}</span>
//   </div>;
// }

// class Dialog extends Component<DialogProps> {
//   jsx(props: DialogProps) {
//     <div class="dialog">
//       <ChildComponent {...props} />
//     </div>;
//   }
// }

// as ComponentWithCustomAttributes<DialogProps>;

const ParentComponent = (props: Array<DialogProps>) => (
  <div>
    <A props={6} />
    <ChildComponent {...props[0]} />
    <ChildComponent.repeat for={props} />
    <ChildComponent.repeat for={["f"]} />
    <Dialog props={props[0]} />
    <ChildComponent repeat={props} />
    <ChildComponent props={props[0]} />
    <nest use={ChildComponent} props={0} />
    <ChildComponent.nest props={0} />
  </div>
);
ChildComponent.repeat;
// const Foo = Component((props: Animal) => <div>{props.name}</div>, {}, {});
// const Bar = Component((_props: Animal) => );

// const Other = Component((props: Animal) => (
//   <div>
//     <Foo props={props} />
//     <Bar props={props} />
//   </div>
// ));

mount("main", ParentComponent, { name: "fox" });
