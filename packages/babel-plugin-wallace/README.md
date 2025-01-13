# babel-plugin-wallace

This is the babel plugin which transforms files for wallace.

*Do not put implementation details in here. These notes should generally apply regardless of code changes.*

## Development notes

* This is a babel plugin, so you need to understand a bit about that (see below).
* This package should be versioned in tandem with `wallace` (see monorepo README).

#### TypeScript

There is very little documentation on writing a Babel in TypeScript, other than [this issue](https://github.com/babel/babel/issues/10637). The plugin needs to be compiled to CommonJS to work with node. See **package.json** scripts.

#### Presets

Babel will typically read from the local **babel.config.cjs** which should look like this:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: ["@babel/preset-typescript", "@babel/preset-env"],
};
```

However, this plugin must work if either of those presets are missing (and to a degree, if others are added) so it is important to test changes with each permutation.

There should be tests which check this, but if making changes to the visitors then it is worth checking explicitly.

#### Tests

We do not test the plugin in isolation as:

1) The generated code depends on the wallace library, so we test over there.
2) The resulting output changes too often over time to validate maintaining tests.
3) The internal code changes too much to validate testing bits of that.

So we make sure to cover anything we think might break in the wallace tests, even if it doesn't seem obvious from there why it would.

#### Checking output

You can see the effect of the plugin by running a file through babel with npx:

```
npx babel src/index.jsx
```

The playground app's `babel.config.cjs` has toggles to disable presets, and npm scripts to run checks. Bear in mind you need to recompile if you've made any changes.

## Babel notes

These are just pertinent notes/reminders from the [Babel handbook](https://github.com/kentcdodds/babel-plugin-handbook/blob/master/README.md), which you should read. The [AST explorer](https://astexplorer.net/) is also very helpful, except it doesn't do JSX.

### Overview

Babel is a tool which parses source code into an AST and traverses the nodes. Babel itself doesn't transform anything, it's the plugins which do that.

Plugins work by declaring "visitors" which get called when a particular node type is visited, and may apply transformations.

Presets are just collections of plugins.

### Visiting order

According to [Plugin Ordering](https://babeljs.io/docs/plugins/#plugin-ordering), Babel loads plugins in the order declared, then (plugins from) presets in reverse order:

```js
module.exports = {
  plugins: [1, 2, 3],
  presets: [5, 4],
};
```

However, it ***may appear*** to do the opposite!

Babel traverses the tree of nodes top to bottom, so if plugin 5 visits a higher level node, that node (and its children) may be transformed by the time plugin 1 gets to visit a deeper node.

##### Example

Suppose we have the following `babel.config.cjs` file:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

This as our `babel-plugin-wallace`:

```js
module.exports = () => {
  return {
    visitor: {
      JSXElement(path) {
        console.log(path.parent.type);
      },
    },
  };
};
```

And this is the source code:

```jsx
const Foo = ({name}) => (
  <div>
    <p>{name}</p>
  </div>
)
```

The console will log `ArrowFunctionExpression` because that is indeed the parent node's type.

However if we add the `@babel/preset-env` preset to our config:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: ["@babel/preset-env"],
};
```

Then the console logs `ReturnStatement` which probably breaks our plugin, and makes us doubt whether Babel really applies plugins before presets.

However the explanation is logical.  Babel visits the `ArrowFunctionExpression` before visiting its child nodes, such as the `JSXElement`. The `@babel/preset-env` transforms the `ArrowFunctionExpression` into this:

```jsx
var Foo = function Foo(_ref) {
  var name = _ref.name;
  return <div>
    <p>{name}</p>
  </div>;
};
```

During the transformation the `JSXElement` node got moved into a `ReturnStatement`. Babel continues walking the (freshly modified) tree, and eventually reaches the `JSXElement`, calling the visitor in `babel-plugin-wallace` which detects its parent as the `ReturnStatement`.

One way to get around this would be for `babel-plugin-wallace` to declare a `ArrowFunctionExpression` visitor, which as per ordering rules, will be called before `@babel/preset-env` does:

```js
module.exports = () => {
  return {
    visitor: {
      ArrowFunctionExpression(path) {
        // do stuff before @babel/preset-env
      },
    },
  };
};
```

The node can be passed to another visitor. See https://github.com/babel/babel/issues/12976

See mixed mode below.

### Building

You create new nodes using `t` like so:

```js
path.replaceWith(
  t.expressionStatement(t.stringLiteral("Is this the real life?"))  
);
```

All the types are defined [here](https://github.com/babel/babel/blob/master/packages/babel-types/src/definitions/core.js).

### State

Avoid global state at all costs. Also not that state errors may not be apparent until you use a tool such as webpack which loads the plugin and calls it repeatedly.

You can pass it in as state to the `traverse()` method and have access to it on `this` in the visitor.

```
const visitorOne = {
  Identifier(path) {
    if (path.node.name === this.exampleState) {
      // ...
    }
  }
};

const MyVisitor = {
  FunctionDeclaration(path) {
    var exampleState = path.node.params[0].name;
    path.traverse(visitorOne, { exampleState });
  }
};
```

### Examples

https://github.com/babel/babel/tree/main/packages





## Considerations

### Mixed mode

The plugin must work whether `@babel/preset-env` is set or not, meaning we cannot rely on those transformations happening, which is unfortunate as it would simplify things like props destructuring.







```
          // replace path with defineComponent call.
          // path.replaceWithSourceString("8");
          // path.replaceWith(
          //   t.binaryExpression("**", path.node.left, t.NumericLiteral(2)),
          // );
          path.remove();
          path.insertBefore();
          path.insertAfter();
          path.replaceWithMultiple([
            t.expressionStatement(t.stringLiteral("Is this the real life?")),
            t.expressionStatement(t.stringLiteral("Is this just fantasy?")),
            t.expressionStatement(
              t.stringLiteral(
                "(Enjoy singing the rest of the song in your head)",
              ),
            ),
          ]);
```

