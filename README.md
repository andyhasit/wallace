# Wallace

*The framework that gives you back your freedom!*

**[npmjs.com/package/wallace](https://www.npmjs.com/package/wallace)** 

[**github.com/andyhasit/wallace**](https://github.com/andyhasit/wallace)

## What is this?

Wallace is a UI framework which you can use in place of React, Angular, Vue, Svelte, Solid etc. Here's why you might want to:

1. Wallace is much **easier** to use than any of those.
2. You end up with more **readable** and **reusable** code.
3. You end up with **smaller** bundles and **faster** DOM updates.

Lastly, you get all this without losing the **freedom** which frameworks rob you of.

## Guided tour

The tour covers everything you need to get started, and explores the **bold** claims made above.

This is not a tutorial, but if you want to play with some code, either:

* Blitzstack in your browser.
* npx create-app

```sh
npx create-wallace-app my-app
```

### Components

Wallace controls the DOM through a tree of nested components, each of which updates its own section of the DOM tree, then tells its nested components to do the same, and so on.

There is no central engine, each component operates independently, and can be customised.

### Special JSX

Components defined as functions which return JSX:

```jsx
import { mount } from "wallace";

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done} />
    <span>{text}</span>
  </div>
);

mount("main", Task, { text: "Learn Wallace", done: false });
```

This looks similar to React, but Wallace uses JSX very differently. Rather than mangle your JSX with control structures:

```jsx
// THIS IS NOT ALLOWED
const TaskList = (tasks) => (
  <div>
    {tasks.map(({ text, done }) => (
      <Task text={text} done={done} />
    ))}
  </div>
);
```

Wallace uses special tag formats and attributes to do its thing:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

If you're coding along, you'll need to change the last line:

```jsx
mount("main", TaskList, [
  { text: "Learn Wallace", done: false },
  { text: "Star it on gtihub", done: false },
]);
```

#### Special tags

There are just three special tags. We've already seen `ComponentName.repeat` and here's its counterpart to nest a single component:

```jsx
const TaskList = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} />
    <Task.nest props={tasks[1]} />
  </div>
);
```

Both use the `props` directive, but `.nest` expects a single object, whereas `.repeat` expects an array. If you're using TypeScript (see below) your IDE will warn you if you send invalid props.

The third special tag is for stubs, which let you reuse and extend components:

```jsx
const BaseDialog = (tasks) => (
  <div>
    <h3>{title}</h3>
    <stub:content />
    <stub:buttons />
  </div>
);

const MyDialog = extendComponent(BaseDialog)
MyDialog.prototype.content = TaskList
MyDialog.prototype.buttons = () => (
  <div>
    <button>OK</button>
    <button>Cancel</button>
  </div>
);
```

#### Directives

There are many directives, but you only need to remember one:

```jsx
const TaskList = () => (
  <div help></div>
);
```

This displays the in-browser help panel which lists all the available directives.

Although slightly less flexible than regular JSX, it brings far more power to your fingertips.

### Examples

#### Reactive

By default components are not reactive, because that's a really bad idea (link to article). However it is useful in some cases, such as forms.

Show onChange set done = ! done and explain why that works. 

Show bind.

#### Stubs

Massively cleaner and more reusable code compared to React. 

#### Class toggle

Also mention static.

This shows the wealth of functionality which is available.

#### Debug

Before we cover the advantages of this system, let's briefly look at how it works.

### Typescript



### Compiler magic

- mention function rules
- more power and lighter bundles
- mention the objects it creates

##### 

There are 2 reasons Why objects matter.

### Coordination

With React you don't really have components, just stateless functions, and this makes it very difficult to coordinate updates and share state. You either need to pass callbacks in props, or use hooks, both of which are so awkward that its quite baffling that anyone uses these frameworks.

Wallace has a very simple solution. In addition to props, you can also pass an object down the tree.

A controller is just an object (any object) which components will pass down to nested components, independently of props:

```
example
```

In order to be useful, a controller needs a reference to a component which it can update.

Advantages:

* So much simpler and cleaner.
* Mostly non-framework code.

### Freedom

### Performance

* Benchmark
* Granular updates.
* V8 engine rules
* Pools
* Memory leaks

# ----------------

##### This approach has several benefits:

##### Clearer code

The JSX is more compact, correctly indented and easier to read. This has several knock on effects for your code base.





You lose a bit of flexibility, 



As you can see, Wallace uses special conventions in JSX to 

This may feel debilitating if you're used to dynamic JSX, but it turns out you can do a lot more with static JSX. Here is how you repeat nested components with Wallace:

Instead,



Except that Wallace doesn't *call* these functions, instead it *replaces* them with generated code at compilation. The function is really just a placeholder for JSX, and there are restrictions on what it can include.

The function may 



It's only purpose is to act as a placeholder for JSX

neither a regular function, its just a placeholder 

. The function is really just a placeholder for JSX which get replaced with generated code during compilation.

, nor regular JSX







 gets replaced with generated code during compilation.

 will never execute, and the JSX 

is not regular JSX . 

these are not real functions, 



they are just placeholders for JSX which get replaced with generated code during compilation.







Wallace was designed to bring you freedom. However, at first glance it looks like a cheap React clone with a lot less freedom :-| 



These functions won't exist at run time, will never be executed, and therefore can't contain any JavaScript, except for snippets inside JSX expressions which gets copied over to the generated code.

Placeholder expressions may return values:

```jsx
<span>{done ? text : text.toUpperCase()}</span>
```

But may not return nested JSX:

```jsx
// THIS IS NOT ALLOWED
const TaskList = (tasks) => (
  <div>
    {tasks.map(({ text, done }) => (
      <Task text={text} done={done} />
    ))}
  </div>
);
```

This may feel debilitating if you're used to dynamic JSX, but it turns out you can do a lot more with static JSX. Here is how you repeat nested components with Wallace:

Instead, Wallace uses a very small number of special rules

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

As you can see, Wallace uses special conventions in JSX to 





Think of the JSX as a TypeScript-friendly HTML string which has access to props.

This doesn't feel like freedom at all, but as it turns out, these restrictions open more doors than they close. We'll get to that, but first let's see how Wallace handles repeat syntax:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

Wallace uses special tag conventions plus attributes (called directives) to do its thing - leaving your JSX clean, compact and correctly indented.



However these functions are never executed. Instead they are parsed and replaced with generated code during compilation. They are essentially just placeholders for JSX, whose overall structure must be static. 



This means you can't do things you normally do with JSX, like this:

```jsx
const TaskList = (tasks) => (
  <div>
    {tasks.map(({ text, done }) => (
      <Task text={text} done={done} />
    ))}
  </div>
);
```







The functions may only contain JSX



, so no conditionals or loops. You can't place any JavaScript before or around JSX elements - only inside expressions, as long as that doesn't return JSX.

So this is allowed:

```jsx
<span>{done ? text : text.toUpperCase()}</span>
```

This is not allowed:

```jsx
<div>
  {done ? (
    <span>{text}</span>
  ) : (
    <span>{text.toUpperCase()}</span>
  )}
</div>;

const TaskList = (tasks) => (
  <div>
    {tasks.map(({ text, done }) => (
      <Task text={text} done={done} />
    ))}
  </div>
);
```





The function is just a scoped placeholder for static JSX 

You are only allowed static JSX not allowed any code inside the function, except inside expressions.

This means you can't put any JavaScript before or around JSX elements:

```jsx
<div>
  {checked ? <span></span> : <span></span>}
</div>
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

```tsx

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done} />
    <span style:color={done ? 'grey' : 'black'}>
      {text}
     </span>
  </div>
);
```

