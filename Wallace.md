# Wallace

*Restoring freedom to the front-end.*

```
npm i wallace
```

## What is this?

Wallace is a front-end framework you can use in place of React, Angular, Vue, Elm, Svelte, Solid, Riot, Preact, Knockout, Lit, Aurelia etc...

Though initially built to restore the **freedom** you inevitably lose when using a framework, it turns out the design also makes Wallace:

* Much **simpler** to use than other frameworks.
* More **productive**, especially as the project grows.
* Much **faster** - both on page loads and DOM updates.

We'll cover these bold claims in the tour, then finish up by exploring freedom and why that matters.

## The tour

This is not a tutorial, but it covers almost everything, and you can code along either in the [browser](https://stackblitz.com/edit/wallace-0-0-5-ts) or on your machine:

```
npx create-wallace-app my-app
```

### Compiled JSX components

Wallace controls the DOM with components which you define as functions which return JSX:

```jsx
import { mount } from "wallace";

const Task = ( task ) => <li>{task.text}</li>;

const TaskList = ( tasks ) => (
  <ul>
    <Task.repeat props={tasks} />
  </ul>
);

mount("main", TaskList, [
  { text: "Learn Wallace" },
  { text: "Star it on gtihub" },
]);
```

This looks similar to React, except we used `Task.repeat` instead mangling our JSX with control structures:

```jsx
// React code. Won't work with Wallace!
const TaskList = (tasks) => (
  <div>
    {tasks.map(task => (
      <Task text={task.text} />
    ))}
  </div>
);
```

Doing this is not allowed in Wallace. You can put JavaScript curly braces, but it

For example, to repeat a nested component in React, you'd have to write something like this, which throws the readability of XML out of the window:

Another difference which isn't obvious



:

1. These functions are never executed. They are replaced with generated code at compilation.
2. The JSX follows very different rules.



For example, to repeat a nested component in React, you'd have to write something like this, which throws the readability of XML out of the window:

Mention how React works, and that Wallace has real components.

Default way of using JSX is to convert it to virtual DOM, but this is really limiting.

Compiled. Use special tags and attributes.

component definition: constructor + prototype, equivalent of class.

### Examples

#### Nesting

Mention TypeScript

#### Hiding

more compact and readable.

#### CSS toggles

Shows the power.

#### Dev assitance

help and debug.

#### Custom update

Override update method, show refs, explain how internals work.

Explain what the two methods do.

#### Stubs



#### Reactivity

#### Services

#### Pool control



### Freedom

The point is that it's just a tree of normal objects.







-------



Wallace was built to give you back the freedom which those frameworks take away, hence the name (in case you missed it).

#### Safety through Freedom

If your chosen framework doesn't let you:

1. Easily and safely manipulate the DOM outside or alongside it.
2. Override or modify how it does its checking and updating.

Then there's always a risk that some page in your app will perform poorly, and swallow a disproportionate amount of dev time, often with very little to show for it as the framework both causes the issue, and prevents you from implementing a decent fix!

Remember that:

1. People don't notice the fast pages, only the slow ones.
2. Time saved by terse syntax can easily be dwarfed by time spent fixing pesky issues.
3. Benchmark speeds have no bearing on how likely this is to happen, or how painful it is when it does.

Wallace's design doesn't just allow all this, it enables it seamlessly at as granular a level as you need, making it the safest choice for applications where performance matters, now or later.

#### Fringe benefits

It turns out this design 

In the process of refining 



But because people like benchmarks, here's where Wallace lands:

[img]



