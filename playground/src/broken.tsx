import { jsx, mount, Component } from "wallace";

interface Props {
  clicks: number;
}

const btnClicked = ({ p, c }: { p: Props; c: Component }) => {
  p.clicks += 1;
  c.update();
};

const ClickCounter = (p: Props) => (
  <div>
    <button on:click={btnClicked}>+</button>
    <button onClick:cpe={btnClicked}>+</button>
    <span>Clicked {p.clicks} times</span>
  </div>
);

mount("main", ClickCounter, { clicks: 0 });

const getTotal = (counters) =>
  counters.reduce((acc, ctr) => acc + ctr.clicks, 0);

let foo = false;
const toggleFoo = (c) => {
  foo = !foo;
  app.update();
};

const setA = [{ clicks: 4 }, { clicks: 2 }];
const setB = [{ clicks: 1 }, { clicks: 3 }];

const boo = { clicks: 9 };
const items = [2, 3, 4];
const MyComponent = (props: Props) => <div>Hi</div>;

const SmollComponent = 9;
const ClickCounterApp = (
  <div>
    <div hidden={foo}>Foo</div>
    <button on:click={toggleFoo(c)}>toggleFoo</button>

    <span>Set A</span>
    <div hidden={!foo}>
      <repeat:ClickCounter for={setA} />
    </div>
    <span>Set B</span>
    <div>
      <SmollComponent for={setB} />
      <MyComponent {...boo} />
      <div repeat={MyComponent} for={[]} />
      <MyComponent {...boo} as:foo />
      <MyComponent />
      <MyComponent as:foo />
      <nest:MyComponent props={boo} />
      <div for={items}>{ClickCounter}</div>
    </div>
  </div>
);

const app = mount("main", ClickCounterApp, []);

interface User {
  name: string;
}

interface JC {
  (data: any): string;
}

// const UserDetails = (user: User) => <div>Hi {user.name}</div>;

const UserDetails = jsx((user: User) => (
  <div>
    <i>Hi {user.name}</i>
  </div>
));

const NoProps = jsx(() => <div>Hi</div>);
const SimpleProps = jsx((a: number) => <div>Hi</div>);

const Alt = {
  jsx(user: User) {
    return <div>Hi {user.name}</div>;
  },
};

class UserDetails2 extends Component<User> {
  jsx(user: User) {
    return <div>Hi {user.name}</div>;
  }
}

// const UserDetails2 = class {
//   constructor() {}
//   bar() {
//     return "Hello World!";
//   }
// };

UserDetails.call(app);

const UserList = (manager: User, users: User[]) => (
  <div>
    <UserDetails props={manager} as:manager />
    <UserDetails repeat={users} as:list />
    <NoProps props={9} />
    <SimpleProps props={9} />
    <UserDetails2 props={manager} as:manager />
    <UserDetails2 repeat={[9, 8]} as:list />
  </div>
);

/**
 *
 */

const title = "Click Counter";
const description = `
This is a description
that will fit on multiple lines.
`;
