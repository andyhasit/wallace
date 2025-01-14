# Wallace

*The framework that gives you back your freedom!*

**[npmjs.com/package/wallace](https://www.npmjs.com/package/wallace)** 

[**github.com/andyhasit/wallace**](https://github.com/andyhasit/wallace)

## What

Wallace is a UI framework you can (and hopefully will) use in place of React, Angular, Svelte, Vue, Solid etc.

## Why

Compared to other frameworks, Wallace:

* Is much **simpler** to use (learn everything in ~25 min).
* Produces **smaller** bundles.
* Runs a lot **faster**.
* Results in **cleaner** code.
* Has more **powerful** architectural and optimisation capabilities.

But what makes Wallace unique is that you get all this without losing your **freedom**.

Most frameworks don't let you interact with the DOM they control, or change the way they control it. You don't often need to do this, but if you do and you can't, then you're in real trouble.

Wallace lets you do both those things. You can also do anything you could do in vanilla JS, but with added scaffolding to do it safely and easily. This means you will never, ever be cornered by the framework, and also able to match vanilla speeds if you need to.

Of course you may never need that, in which case you can just enjoy a **simpler**, **smaller**, **faster**, **cleaner** and more **powerful** tool to work with.

## Installation

TODO: offer blitzstack, or create-app.

#### Manual

Install `wallace` (which installs `babel-plugin-wallace` at the same version) and save to your dev dependencies:

```sh
npm i wallace --save-dev
```

Add this to your **babel.config.cjs** or equivalent:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

And add this to your **tsconfig.json** file if using TypeScript:

```
{
  "compilerOptions": {
    "jsx": "preserve",
  },
}
```

You'll also need a bundler like [Webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/) or [Vite](https://vite.dev/). 

## Syntax

Wallace was designed to bring you freedom. However, at first glance it looks like a cheap React clone with a lot less freedom :-| 

You can define components as functions which return JSX, just like React:

```tsx
import { mount } from "wallace";

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done} />
    <span style:color={done ? 'grey' : 'black'}>
      {text}
     </span>
  </div>
);

mount("main", Task, { text: "Learn Wallace", done: false });
```

But other than the enclosing function, you're not allowed any JavaScript *around* JSX elements, so no conditionals or loops:

```tsx
// THIS IS NOT ALLOWED
const TaskList = (tasks) => (
  <div>
    {tasks.map(({ text, done }) => (
      <Task text={text} done={done} />
    ))}
  </div>
);
```

You're also not allowed any JavaScript before the JSX:

```tsx
// THIS IS NOT ALLOWED
const Task = ({ text, done }) => {
  const color = done ? 'grey' : 'black';
  return (
    <div>
      <input type="checkbox" checked={done} />
      <span style:color={color}>{text}</span>
    </div>
  )
};
```

This doesn't feel like freedom at all, but as it turns out, these restrictions open more doors than they close. We'll get to that, but first let's see how Wallace handles repeat syntax:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

Wallace uses special tag conventions plus attributes (called directives) to do its thing - leaving your JSX clean, compact and correctly indented.

### Special tags

There are just two special tag formats for nesting components:

```jsx
// Nest a component, passing an object as props:
<Task.nest props={task} />

// Repeat a component, passing an array of objects as props:
<Task.repeat props={tasks} />
```

Passing all the props in one attribute is just a lot cleaner. If you need to transform the object first, you outsource that to a function:

```jsx
<Task.nest props={getTaskProps(task)} />
```

The only other special tag is for stubs:

```jsx
// Define a stub, which components that extend this component can override:
<div>
  <stub:title />
  <stub:body />
</div>
```

As will become clear, Wallace works very differently to React, and is a lot more powerful.

### Directives

Directives are special attributes which can do just about anything:

```tsx
// Show the help panel on your browser so you don't have to remember all this:
<div help></div>

// Conditionally show/hide elements:
<div hide={done}>Schedule task</div>
<div show={done}>Archive task</div>

// Set up a class toggle:
<div class="mt-2 p1" css:overdue="red" toggle:overdue={!done}></div>

// Use variables in attributes, but only once:
<div static:class={clunkyClassString}></div>
<div static:style={clunkyStyleDefinition}></div>

// Make a component reactive:
<div reactive></div>

// Bind an element propery to a value:
<input type="checkbox" bind:checked={done} />

// Debounce an event:
<input type="text" debounce:onKeyUp={500} onKeyUp={handleKeyUp(e, text)}/>

// Log the component props when it is updated:
<div debug></div>

// And of course, you can define your own directives:
<div so:bad={ass}></div>
```

The cool part about directives is that they operate during compilation.

### Compilation

Wallace uses its own Babel plugin, which you add to your **babel.config.cjs** or equivalent:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"]
}
```

The plugin looks for function that only contain JSX, which are deemed to be components. It parses their JSX and replaces the entire function with generated code. Directives hook into this and add or modify the generated code.

 Bear in mind this is all done during compilation, which means:

1. A component function will *never be executed*. Its source code will be *read*, then *replaced*, well before the code is loaded into the browser.
2. The JSX will also be read, not executed, which is why you're not allowed JavaScript around elements.
3. The code which interprets directives, including the directive code itself, doesn't make it into the browser. Only the generated code does.

This allows us (or you) to create really powerful syntax without denting bundle size or performance.

The generated code creates a constructor function along with a prototype. When you mount or nest a component definition, Wallace creates a component instance:

```tsx
const component = new TaskList()
```

So unlike React, your components are real objects, which you can pass around, and whose prototypes you can extend or modify. This has interesting implications which we'll cover later.
