# Wallace

*Brings the joy back to front end development.*

## What is it?

Wallace is a framework for building dynamic web UIs using modern JavaScript or TypeScript, much like React, Angular, Vue, Svelte etc. 

Compared to those, Wallace is:

* **Cleaner** - you'll end up with far more readable code, letting you work quicker.
* **Faster** - this deserves its own section, see [performance](#permformance).
* **Safer** - there's almost nothing to break, and if it does, the fix is easy.

But most of all, Wallace is a whole lot more **enjoyable** to work with. You'll love it.

## Quick tour

### A reactive click counter

<div>
    <button>New</button>
    <button>3</button>
    <button>0</button>
    <button>1</button>
<div>


To use Wallace, simply define a tree of components using JSX syntax and attach the root component to a DOM element:

```jsx
import {attach} from 'wallace'

const ClickCounter = (counter) => (
  <button onClick={counter.clicks ++}>
    {counter.clicks}
  </button>
);

const ClickCounterApp = (counters) => (
  <div reactive>
    <button onClick={counters.push({clicks: 0})}>Add Counter</button>
    <ClickCounter repeat={counters} />
  </div>
);

attach("some-div-id", ClickCounterApp, [{clicks: 0}]);
```

Although it looks like this could be React code, there are three key differences:

1. The `onClick` expressions are calls, not callbacks.
2. The `ClickCounter` is repeated using a `repeat` attribute, rather than being wrapped in a loop expression.
3. Everything seems to update by itself without any `setProps()` or state hooks, thanks to that `reactive` attribute.

Explaining these differences conveniently summarise how Wallace works.

#### Explanation

##### Interpreted JSX

Although we use JSX syntax, it doesn't work like JSX. Wallace *reads* JSX during compilation and replaces it with generated code, rather than *executing* at run time. 

This restricts what you can do inside the JSX. You can't wrap elements in expressions for example:

```jsx
const people = ['jane', 'jemima', 'jessica']
const People = (
  <ul>
   {/* --- This is not allowed --- */}
   {people.map(name => (
     <Person props={name.toUpperCase()} />
   ))}
  </ul>
)
```

Instead you use special attributes called "directives" such as `repeat` to achieve the same result, but with less clutter in your JSX:

```jsx
const people = ['jane', 'jemima', 'jessica']
const Person = (name) => <li>{name.toUpperCase()}</li>
const People = (
  <ul>
    <Person repeat={['jane', 'jemma', 'jessica']} />
  </ul>
)
```

##### Directives

Wallace has many directives which do a variety of useful things, but you only need to remember one:

```jsx
const MyFirstComponent = (
  <div help>
    I don't know what I'm doing...
  </div>
)
```

This brings up an interactive helper in your browser which documents all the directives. It works offline, so you can develop apps while sitting on a tropical beach.

Directives run during compilation, not at run time, which has two main implications:

1. A directive may do all sorts of validation and fancy logic without slowing down your app. All that goes into your bundle is the generated code, not the logic used to build it.
2. We can create as many directives as we like, with different permutations.

This lets us provide clean and powerful syntax which results in the most efficient code.

Of course you can define your own directives, which get displayed in the interactive helper too.

##### Expressions

Code expressions in JSX get moved to a new location in the generated code, possibly with some transformation. The buttons work because the code in the expression gets pasted into a function which gets called by the `onClick` handler:

```js
function (props, event, component) {
  props.clicks ++
}
```

If you'd rather pass a callback you can, and even get to choose which arguments get passed in what order by passing a flag to the `onClick` directive which can contain letters **e**, **p** and **c** for event, props and component respectively

```jsx
const incrementClicks = (event, props) => {
  event.preventDefault()
  props.clicks +1
}

const ClickCounter = (counter) => (
  <button onClick:ep={incrementClicks}>
    {counter.clicks}
  </button>
);
```

Flags let us change the behaviour of directives, creating even more powerful syntax options.

##### Reactivity

The `reactive` directive tells a component to wraps its props in a proxy which detects mutations to itself, and tells component to update when that happens.

So when you click any of the buttons, the `ClickCounterApp` component updates itself, and then its child components.



It detects modifications in nested items too, so when `ClickCounter` changes a single counter, the `ClickCounterApp` updates.

causes a component update when its props object is modified (that's modified, ) regardless of where it is modified

That's modified, not when new 

Reactivity frameworks look in a tutorial, but

 in the real world the bugs they cause will drain your client's budget and your to live.





Plan:

* Explain why it's bad, where you use it, and when you don't
* Understand that components update



tells a component to wrap its props (in this case an array of objects) in an object which detects changes, which trigger an update of the component.

```jsx
const incrementClicks = (counter) => counter.clicks +1;
const addCounter = (counters) => counters.push({clicks: 0});
const total = (counters) => counters.reduce((c, acc) => c.clicks + acc, 0)

const ClickCounter = (counter) => (
  <button onClick:p={incrementClicks}>
    {counter.clicks}
  </button>
);

const ClickCounterApp = (counters) => (
  <div reactive >
    <span>Total: {total(counters}</span>
    <button onClick:p={addCounter}>Add Counter</button>
    <ClickCounter repeat={counters} />
  </div>
);
```



~~Fully reactive frameworks may look impressive in a tutorial, but in the real world they invariably drain the client's budget and the developer's will to live by causing endless subtle bugs that are time consuming to diagnose, hard to detect and easy to regress on.~~

Reactive frameworks tend to wow us in their tutorials, but shaft us in real life with subtle bugs that are hard to diagnose, which will drain your client's budget and your to live.

Yet reactivity is very useful in places such as forms, which are a pain to work with in a totally non-reactive framework, like React. Wallace gives you the best of both worlds by only being reactive where you tell it to be. 



replaces a component's props with an object which 



wrap its props in a proxy which updates that component whenever the props object is modified. So when the `ClickCounter` modifies its props object, the `ClickCounterApp` updates, and that update cascades down to the `ClickCounter`.

The reactive behaviour is isolated and predictable. However, it should still only be used for components which are supposed to change their own data, like a form which is yet to be submitted.



### Non-reactive click counter

Rather than pass down a plethora of bound callbacks, a much saner approach is to create a single object which contains the state and methods for working with it, and passing that down the component tree. We call that a hub:

```js
class Hub {
  constructor() {
    this.counters = [{clicks: 0}]
    this.root = undefined
  }
  getCounters() {
     return this.counters.map((counter) > {counter, hub: this})
  }
  add() {
    this.counters.push({clicks: 0})
    this.root.update()
  }
  increment(counter) {
    counter ++
    this.root.update()
  }
}
```



```jsx
import { attach } from 'wallace'
import { Hub } from './hub'

const ClickCounter = ({counter, hub}) => (
  <button onClick={hub.increment(counter)}>
    {counter.clicks}
  </button>
);

const ClickCounterApp = (hub) => (
  <div saveAs:root>
    <button onClick={hub.add()}>Add Counter</button>
    <ClickCounter repeat={hub.getCounters()} />
  </div>
);

attach("some-div-id", ClickCounterApp, new Hub());
```

All the calls in JSX are now calls to hub methods. Our components are now rather dumb and vacant (or to use the Scots term: *wallace*) components which do little more than ferry calls and control display. 

And this is exactly how you want it. If anything is broken, there's a 97% chance its in the `Hub` class, which is plain JavaScript with no framework code in sight. A framework is a black box which you can't see into.

There's no way to explain how much time this saves you. Wallace's genius lies in not doing any thinking for you.

You're only using the framework to update the DOM, nothing more.



```jsx
<div beforeUpdate={}></div>
```





Directives help you move logic out of your JSX, letting it act as a clear view of the DOM structure with minimal annotations to highlight the dynamic parts.

This is important, as **visibility** of what you're working with is one the three critical factors to productivity. The other two are **predicitibility** and **delinieation**.

An equally important factor is **delineation**. If your logic is embedded inside framework constructs and it stops working, then

Just as importantly, all the logic you move *out* becomes non-framework code. If the code above stops working, it is easy to determine whether the fault is in `incrementClick` or the JSX.

act as clean and uncluttered  

Because its more compact, you can group them together.

You might not stomach going back to React.

Moving logic out of your components into functions or objects has another major advantage: its non framework code. 

This is so important, because things go wrong...



only for ...



so you get the benefits without the risks.



 The `reactive` directive tells a component to watch its props, and call `this.update()` whenever it is modified.

It is isolated. 

The reason the `ClickCounter` also triggers the update is because the props is the same object objects are passed down to  object, changing those also triggers the root update.

If we removed the `reactive` directive from our example, we'd have to update the `ClickCounterApp` manually after every change. 

This is easily done for the case of adding a new counter:

```jsx
const addCounter = (counters, component) => {
  counters.push({clicks: 0});
  component.update()
}

const ClickCounterApp = (counters, component) => (
  <div>
    <button onClick={addCounter(counters, component)}>Add Counter</button>
    <ClickCounter repeat={counters} />
  </div>
);
```

But how about when we increment a count?

There are several convoluted ways in which you could do this, among the worst of which feature in the React guide.

But there is a better way.

## Status

Wallace is still under active development.

### Usage

It is not ready to use, but here are some notes for when it is.

##### Webpack

In development mode set the following to point stack traces to your source code:

```
config.devtool = "eval-source-map";
```

If you don't set devtools, then you will see the generated code, which can be quite useful when debugging Wallace itself.

```jsx
import React, { useState } from 'react';

function App() {
  // State to keep track of counters
  const [counters, setCounters] = useState([]);

  // Function to add a new counter
  const addCounter = () => {
    setCounters([...counters, 0]); // Initializing each new counter to 0
  };

  // Function to handle click event for a counter button
  const handleCounterClick = (index) => {
    const newCounters = [...counters];
    newCounters[index] += 1; // Incrementing the count for the clicked button
    setCounters(newCounters);
  };

  return (
    <div>
      <h1>Dynamic Counter Buttons</h1>
      <div>
        {counters.map((count, index) => (
          <button 
            key={index} 
            onClick={() => handleCounterClick(index)}
            style={{ margin: '5px' }}
          >
            Button {index + 1} - Clicked {count} times
          </button>
        ))}
      </div>
      <button onClick={addCounter} style={{ marginTop: '20px' }}>
        Add Counter
      </button>
    </div>
  );
}

export default App;
```

##### Updates

Our app currently updates as soon as the data changes thanks to the `reactive` directive, which we'll look at next. Without it, you must explicitly tell components to update after data changes.

You can either do that by passing new props with `setProps()` or `update()` if you're keeping the existing props.

One way to do this is by passing a reference to the component to callbacks:

```jsx
const incrementClicks = (component, counter) => {
  counter.clicks +1;
  component.update();
}

const ClickCounter = (counter) => (
  <button onClick:cp={incrementClicks}>
    {counter.clicks}
  </button>
);
```

Of course, that only updates the `ClickCounter` component that was clicked. While you could do the same for the `Add Counter` button

```jsx
const addCounter = (counters, component) => {
  counters.push({clicks: 0});
  component.update();
}

const ClickCounterApp = (counters) => (
  <div>
    <button onClick:pc={addCounter}>Add Counter</button>
    <ClickCounter repeat={counters} />
  </div>
);
```



The components look a lot cleaner with the operations moved out to functions - something we'll revisit in a bit.



no setProps. Same object.

clean



issue: totals

```jsx

```

