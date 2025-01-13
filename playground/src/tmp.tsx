import { Component } from "wallace";

interface Fruit {
  name: string;
}

interface NotFruit {
  notname: string;
}

const FruitItem = Component((fruit: Fruit) => <p>{fruit.name}</p>);

const Foo = <p>0</p>;
const Bar = Component(<p>0</p>);
const Baz = {};

// class FruitItem2 extends Component<Fruit> {
//   jsx(fruit: Fruit) {
//     return <p>{fruit.name}</p>;
//   }
// }

const FruitList = Component((fruits: Fruit[]) => (
  <div>
    <Foo />
    <Bar as:list />
    <FruitItem repeat={fruits} as:list />
    <FruitItem repeat={[0, 5]} as:list />
    {/* <FruitItem2 repeat={[0, 9]} as:list /> */}
  </div>
));

const dostuff = (c: Component<any>) => {
  c.update();
};

// console.log(FruitList, Component);

// // const fff: Fruit = {
// //   name: "apple",
// // };

// const eat = (fff: Fruit) => {
//   console.log(fff.name);
// };

// eat({
//   notname: "apple",
// });
// console.log(fff);

// interface Props {
//   clicks: number;
// }

// const onClick = (p: Props, c: Component<any>) => {
//   p.clicks += 10;
//   c.update();
// };

// const counters: Array<Props> = [{ clicks: 0 }];

const ClickCounter = Component((counter: Props) => (
  <div>
    <button class="red" on:click={onClick(counter, c)}>
      <span> yo</span>
    </button>
    <a>Clicked {counter.clicks} times</a>
  </div>
));

// const CounterList = (
//   <div>
//     <ClickCounter repeat={counters} />
//   </div>
// );

// const A = (
//   <div height={tall}>
//     Hello <b>{name}</b>
//     <div hidden={foo}></div>
//     <i help></i>
//     <div base={foo}></div>
//     <i el:user></i>
//     <div bind:keyup={foo}></div>
//     <div repeat={[1, 2, 3]}></div>
//     <div on:click={alert("hello")}></div>
//     <div onblur:p={foo}></div>
//     <div onblur={foo}></div>
//   </div>
// );

// interface BProps {
//   name: string;
// }

// class B extends Component<BProps> {
//   render(props: BProps) {
//     return <div>{props.name}</div>;
//   }
// }

// const C = (animal: Animal) => <div class={tall}>hello {animal.name}</div>;
// const B = ({ name: nameOfAnimal, food: { name: food } }: Animal) => (
//   <div class={tall}>
//     hello {nameOfAnimal} eats {food}
//   </div>
// );

const btnClick = (e, p, c: Component<Animal>) => {
  // console.log(333, e, p, c);
  p.showWalrus = !p.showWalrus;
  // fox.name = "Mr Fox";
  c.update();
};

interface Animals {
  showWalrus: boolean;
  walrus: Animal;
  fox: Animal;
}

let showFox = false;
const toggleGlobal = (e, p, c) => {
  console.log(666, showFox);
  showFox = !showFox;
  c.update();
};

const AnimalList = (animals: Animals, c: Component<Animal>) => (
  <div>
    <button onClick={toggleGlobal}>Also</button>
    <AnimalDiv hide={!animals.showWalrus} props={animals.walrus} />
    <AnimalDiv hide={!showFox} props={animals.fox} />
    <button
      type="button"
      onclick={btnClick}
      foo={c.props.name}
      bar={c.ref.textContent}
    >
      SHoe/hide
    </button>
  </div>
);

AnimalList.prototype.onUpdate = function () {
  console.log(777, this.__stash, JSON.stringify(this.props));
};

// AnimalDiv.prototype.onUpdate = function () {
//   console.log(888, this.__stash, JSON.stringify(this.props));
// };

const app = mount("main", AnimalList, {
  walrus: { name: "Mr Walrus" },
  fox: { name: "Ms Fox" },
  showWalrus: true,
});
// app.ref.title.textContent = "Animalzzzz";



// const AnimalList = Component((animals: Animal[]) => (
//   <div>
//     <AnimalDiv props={animals[0]} />
//   </div>
// ));
// const AnimalDiv = Component((animal: Animal) => (
//   <div>
//     <span style="color: red">{animal.name + "!"}</span>
//     Hello {animal.name}
//   </div>
));
// const AnimalDiv = Component((animal: Animal, e: Event) => (
//   <div>Hello {animal.name}</div>
// ));

// const pool;

// const div = ({ props: { name } }: { props: Animal }, e: Event) => true;

// const not_an_animal = { age: 4 };

// const reverse = (animals: Animal[], _component: ComponentAny) => {
//   animals.reverse();
//   _component.update();
// };

// const AnimalList = Component((animals: Animal[], _component) => (
//   <div>
//     <button onclick={reverse(animals, _component)}>Reverse</button>
//     <div>
//       <AnimalDiv repeat={animals} />
//     </div>
//   </div>
// ));

// // repeat options:

// const One = (animals) => (
//   <div use={AnimalDiv} for={animals}>
//     // code that displays if list is empty
//   </div>
// );

// const Two = (animals) => (
//   <div>
//     <AnimalDiv repeat={animals}>
//       <div>No animals :-(</div>
//     </AnimalDiv>
//   </div>
// );

// // I can probably make pools handle elements before and after, but not multiple
// // Repeats under the same div. I'd need separate objects called repeaters which
// // know the before/after while pool is just that.
// const Three = (animals) => (
//   <div>
//     <div showIf={animals.length === 0}>No animals</div>
//     <AnimalDiv repeat={animals} />
//   </div>
// );

// interface Modalprops {
//   title: string;
// }

// const ModalBase = Component((props: Modalprops) => (
//   <div>
//     <h1>{props.title}</h1>
//     <div stub:content>You can put any content here</div>
//     <div stub:buttons>Default buttons...</div>
//   </div>
// ));

// const DialogWithHub = Component((props: Modalprops) => (
//   <div extends={ModalBase}>
//     <stub:content />
//     <stub:buttons />
//     <div></div>
//   </div>
// ));

// mount("main", AnimalList, [{ name: "walrus" }, { name: "fox" }]);

// const foo = (
//   name: string,
//   c: ComponentAny,
//   event: Event,
//   element: HTMLElement,
// ) => {
//   console.log(name + " " + event.type);
//   console.log(c);
//   console.log(event);
//   console.log(element);
// };

// const MyComponent = (
//   { name }: Animal,
//   _component: Component<any>,
//   _event: Event,
//   _element: HTMLElement,
// ) => (
//   <div>
//     <button onclick={foo(name.toUpperCase(), _component, _event, _element)}>
//       GO
//     </button>
//     <span>{name}</span>
//   </div>
// );
// MyComponent.prototype.foo = foo;

// mount("main", MyComponent, { name: "fox" });

// const Foo = Component((props: Animal) => <div>{props.name}</div>);


import {
  mount,
  Component,
  ComponentDef as Accepts,
  SpComp,
  compile as __,
  SpFunction,
} from "wallace";

interface Animal {
  name: string;
}

const UglyChild = (({ name }: Animal) => (
  <div>{name}</div>
)) as unknown as ComponentDef<Animal>;

class Controller {
  getFoo() {}
}
const OGGChild: Accepts<Animal> = ({ props: { name } }, ctrl: Controller) => (
  <div class={ctrl.getFoo()}>{name}</div>
);

OGGChild.stubs = {
  fff: 66,
};

const ChildComponent = __(({ name }: Animal) => (
  <div>
    <span>{name}</span>
  </div>
));

const Methods = {
  getName() {
    return "fox";
  },
};

const opts = {
  extends: UglyChild,
  methods: Methods,
};

// unknown:ComponentDef<Animal>

const C2: ComponentDef<Animal> = undefined;

const Greeting: SpComp<Animal> = (props) => <div>{props.name}</div>;

class Dialog extends Component<Animal> {
  jsx = (animal: Animal) => (
    <div class="dialog">
      <Greeting props={animal} />
      <Greeting.nest props={animal} />
      <Greeting.repeat each={[animal]} />
      <div>{animal.name}</div>
      <stub:foo />
    </div>
  );
  stubs = () => ({
    foo: <div>{this.props.name}</div>,
  });
}

class Dialog2 extends Component<Animal> {
  jsx(animal: Animal) {
    return (
      <div class="dialog">
        <Greeting props={animal} />
        <Greeting.nest props={animal} />
        <Greeting.repeat each={[animal]} />
        <div>{animal.name}</div>
        <stub:foo />
      </div>
    );
  }
  stubs() {
    return {
      foo: <div>{this.props.name}</div>,
    };
  }
}

mount("main", Dialog, { name: "fox" });
const TaskList = (tasks) => (
  <div reactive>
    <span>Done {tasks.filter((t) => t.done).length}</span>
    <div>
      <Task.repeat props={tasks} />
    </div>
  </div>
);

component = {
  props: undefined,
  nodes: {},
  watches: {},
  previousValues: {},
};