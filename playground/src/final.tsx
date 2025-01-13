import { mount, Accepts } from "wallace";

interface GreetingProps {
  message: string;
  name: string;
}

const Greeting: Accepts<GreetingProps> = ({ message, name }) => (
  <div>
    {name} says {message}
  </div>
);

// Above is same as React, below is where it differs..

const TwoGreetings: Accepts<GreetingProps[]> = (greetings) => (
  <div>
    <Greeting.once props={greetings[0]} />
    <Greeting.once props={greetings[1]} />
  </div>
);

const ManyGreetings: Accepts<GreetingProps[]> = (greetings) => (
  <div>
    <Greeting.repeat props={greetings} showIf={true} />
  </div>
);

mount("main", Greeting, {}, { message: "hello", name: "Wallace" });

const greetings = [
  { message: "goodbye", name: "React", color: "red" },
  { message: "hello", name: "Wallace", color: "green" },
];

// const Greeting: Accepts<GreetingProps> = ({ message, name }) => (
//   <div>
//     <Greeting
//       name={name}
//       fontSize={20}
//       message={message}
//       color={color}
//       callback={onCLick}
//     />
//   </div>
// );

// const Greetingd = ({ message, name, color }) => (
//   <div>
//     {color === "red" ? (
//       <span style="color:red">{message}</span>
//     ) : (
//       <span style="color:green">{message}</span>
//     )}
//   </div>
// );

// const Greeting = ({ message, name }) => (
//   <div style={"color: " + message === "hello" ? "green" : "red"}>
//     Say {message} to {name}.
//   </div>
// );

const Greetingd: Accepts<GreetingProps> = ({ message, name }) => (
  <div>
    {message === "hello" ? (
      <span style="color:red">
        Say {message} to {name}.
      </span>
    ) : (
      <span style="color:green">
        Say {message} to {name}.
      </span>
    )}
  </div>
);
//   } else {
//     return (
//       <div style="color: red">
//         Say {message} to {name}.
//       </div>
//     );
//   }
//   return message === "hello" ?

//   (<div style="color: green">
//     Say {message} to {name}.
//   </div>) : undefined
//   (<div style="color: red">
//     Say {message} to {name}.
//   </div>)
// };


const foo = (x: string) => x.toUpperCase();

const Fruit: Accepts<{ name: string; color: string }> = ({ name, color }) => (
  <div style={{ color }} watch={name > foo(name)}>
    {name}s are {color}
  </div>
);

class Controller {
  constructor() {
    this.root = undefined;
    this.tasks = [
      { id: 1, text: "Learn Wallace", done: false },
      { id: 2, text: "Star it on GitHub", done: false },
    ];
  }
  toggleTask(id) {
    const task = (this.tasks.find((task) => task.id === id);
    task.done = !task.done);
    this.root.update();
  }
}


const Contact = ({ name, email }) => (
  <div>
    <null props={{ name, email }} />
    <div>
      <h1>Contact Details</h1>
      <a href="/edit">Edit</a>
    </div>
    <div class="name">
      <h5>Name</h5>
      <span>{name}</span>
    </div>
    <div class="email">
      <h5>Email</h5>
      <a href={"mailto:" + email}>{email}</a>
    </div>
  </div>
);