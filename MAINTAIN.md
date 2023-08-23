# Maintainer Guide

*This is the guide for Wallace maintainers. Please read if you plan to contribute.*

## Useful information

### Repository contents

General notes:

* Packages which are to be published to npm live under **publish** (calling it **packages** is just annoying for shell completion)

| Directory                    | Purpose                                |
| ---------------------------- | -------------------------------------- |
| examples                     | Contains examples which users can run. |
| publish/babel-plugin-wallace | The babel plugin.                      |
| publish/wallace              | The package called wallace.            |
| website                      | The wallace.js website.                |

### Branch strategy

* The main branch is **develop**, and that's where we prepare the next release. 
* Test must always pass in **develop**.
* Branch off develop for features.

### Making changes

#### Source code changes

Changes to the source code of **wallace** or **babel-plugin-wallace** must:

1. Not break previous functionality (hopefully tests ensure this)
2. Not add functionality we might wish to change or remove later.
3. Take performance into consideration.

#### Adding packages

The rules are:

* If it is required for testing, it goes in the root **package.json**.
* If it is required for the distribution of a package, it goes into its own **package.json** <u>dependencies</u> (devDependencies do not see to be installed).

### Testing

Comments:

1. We must have explicit tests for each feature, even if implicitly tested elsewhere. This will result in a lot duplicate testing but that's OK.
2. All tests live in the **wallace** package.

#### Types of test

There are several ways to test features.

##### Inspect the HTML output

The default way to test. Use `load` to mount the component and use the custom jest matcher `toShow`.

```jsx
import {load} from '../utils'

test('Descriptive name', () => {
  const Foo = 
    <div>
      <span>{name}</span>
    </div>

  let name = 'wallace'
  const component = load(Foo)
  expect(component).toShow(`
    <div>
      <span>wallace</span>
    </div>
  `)
})
```

This doesn't work for cases where we update DOM element states such as hidden or disabled. For these, inspect the DOM element itself.

##### Inspect the DOM element

You can inspect the component's root element directly.

```jsx
test('Descriptive name', () => {
  let disabled = false
  const Foo = <button disabled={disabled}>test</button>
  const component = load(Foo)
  
  expect(component.e.disabled).toBe(false)
  
  disabled = true
  component.update()
  expect(component.e.disabled).toBe(true)
})
```

##### Inspect a wrapper element

You can do the same using a named wrapper.

```jsx
import {load} from '../utils'

test('Descriptive name', () => {
  let disabled = false
  const Foo = 
    <div>
       <button w:btn disabled={disabled}>test</button>
    </div>
        
  const {component} = load(Foo)
  const btn = component.w.btn.e
  expect(btn.disabled).toBe(false)
  
  disabled = true
  component.update()
  expect(btn.disabled).toBe(true)
})
```

##### Inspect the transformed code

Use the `transform` function to transform the code.

```jsx
const {transform} = require('./utils')

test("JSX code out of place throws SyntaxError", () => {
  const opts = {}
  const code = `
    <div>hello</div>
  `
  expect(() => transform(code, opts)).toThrow(SyntaxError)
});
```

This allows us to do things which aren't possible using any of the above methods such as:

* Check the generated code.
* Ensure syntax errors are raised.
* Use custom directives.

> Warning: the structure generated code will change, so tests should make the minimal assumptions about it, preferably restricted to checking that the out does and doesn't contain certain strings.

### Performance

We measure performance by running [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) locally. 

Compare the performance of your changes byL

1. Compiling the **benchmark** package.
2. Copying the output to a new directory in **frameworks/non-keyed** with the name of your changes (e.g. **wallace-feat-xyz**) (is this necessary, can benchmark do it even if path not belong to there?)
3. Run the benchmark for:
   1. Your change
   2. The latest release
   3. The develop branch
   4. Any other frameworks

Note that you need at least 10 runs, and that you must run them at the same time to reduce interference from other processes.

We need a way to formalise this.

#### Size

Size matters. New changes should not add too much to the bundle.

You can obtain the real size with: 

```sh
du -b dist/bundle.js
```

### Publishing

We use [lerna](https://lerna.js.org/) to version and publish:

```
lerna publish --no-private
```

We use npm workspaces to manage dependencies:

```
npm init -w ./packages/a
npm install tap --workspace package-b --save-dev
npm run test --workspace=a
```

https://ruanmartinelli.com/posts/npm-7-workspaces-1/

## Features

*This section discusses various features and aspects.*

### Attributes

#### Value types

JSX attributes can supply a value as **string**, **expression** or **null**:

```jsx
<div foo="baz">A</div>
<div foo={baz}>B</div>
<button disabled>A</button>
```

The rules are as follows:

* If the attribute matches a directive:
  * Process as directive.
* If the attribute name is not a directive:
  * If the value type is an expression:
    * Process as dynamic attribute.

#### Qualifiers

Attributes may also be namespaced:

```jsx
<div foo:bar="baz">A</div>
```

The first part is treated as the name for purpose of matching against a directive. The second part is the qualifier, which is like a preset argument to the directive. If the name does not match a directive then

#### Escape

If there is an attribute you don't want to be interpreted as directive, you can force it to work as a normal attribute:

```jsx
<br _hidden="baz" />
<br _hidden={baz} />
<br _hidden />
```

If there's an expression turns it dynamic.

### Visibility

We use the `hidden` attribute.
