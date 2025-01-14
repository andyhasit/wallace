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

## Quick tour

You work in jsx/tsx files.

Wallace was designed to bring you freedom. However, at first glance it looks like a cheap React clone with a lot less freedom :-| 

You define components as functions which return JSX (so in a jsx/tsx file) just like React:

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

You're also not allowed any JavaScript *before* the JSX:

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
<div class="modal-dialog">
  <h3>{title}</h3>
  <div class="content">
     <stub:body />
  </div>
  <div class="btn-row">
    <stub:buttons />
  </div>
</div>
```

These are placeholders that you implement in components which extend this one, allowing much more code reuse than React.

### Directives

Directives are special attributes which can do just about anything:

```jsx
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

Directives transform code during compilation, meaning the code which powers them doesn't end up in your bundle, only a small amount of transformed or generated code does.

### Compilation

Wallace uses its own Babel plugin, which looks for function that return JSX, and *replaces the whole function* with a constructor function and prototype:

```tsx
const Task = function () {...}
Task.prototype = {...}
```

* Note its not the same function.

Directives simply hook into this process and modify the generated code.

These constructor functions are used to create new instances of the component when nested or mounted:

```jsx
const component = new Task()
```







This constructor function is not the same function as was in your source code. That function was 

This means the function in your source code will *never be executed*. Instead the code is *parsed* and transformed. This is why you aren't allowed JavaScript before or around the JSX - it would simply never run.

You are allowed to place JavaScript inside expressions, and these get copied to the generated code.



 Bear in mind this is all done during compilation, which means:

1. A component function will *never be executed*. Its source code will be *read*, then *replaced*, well before the code is loaded into the browser.
2. The JSX will also be read, not executed, which is why you're not allowed JavaScript around elements.

This allows us (or you) to create really powerful syntax without denting bundle size or performance.

The generated code creates a constructor function along with a prototype. When you mount or nest a component definition, Wallace creates a component instance:

```tsx
const component = new TaskList()
```



### Real components

So unlike React, your components are real objects, which you can pass around, and whose prototypes you can extend or modify. 

This changes how you work with them. No ugly patterns like hooks.

Many are non-repeated.

Then talk about controllers.





### OOP
