# Readme

This documents aspects of **babel-plugin-wallace**.

## Babel basics

Babel processes each module independently of others. It first converts the source code (ES6 syntax) into an an Abstract Syntax Tree (AST). It then traverses that tree, applying transformations in the process. The default transformation is converting ES6 to ES5, but we can specify additional transformations using plugins.

The order of plugins matter. Some plugins just "allow" syntax, such as JSX or class properties, others apply transformations or generate metadata etc... The order of plugins matters.

A plugins exposes a `Visitor` object which has a property fore each node type it is interested in:

```js
module.exports = () => {
  return {
    visitor: {
      JSXElement(path) {
        console.log("Found a JSXElement")
      },
      ObjectExpression: {
        exit(path) {
          console.log("Finished visiting an ObjectExpression")
        }
      }
    },
  }
}
```

You can inspect, modify, add or remove nodes. You can also work with parent and child nodes but there are limitations and considerations. For example, when working with an `ObjectExpression` path, such as:

```js
const fruit = {
  name: 'oranges',
  quantity: 6
}
```

You can inspect the properties, but cannot access their path (and hence modify them) from the `ObjectExpression` visitor. You will only be able to do so from the visitor for `ObjectProperty` or the value (whatever type it may be).

You will also run into trouble trying to delete the object itself from the visitor of one of the property values, as Babel will continue traversing but find itself working on deleted nodes (you may get a `Container is falsy` error).

Consult [The babel handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) as primary documentation on writing plugins. 

## Wallace 

The plugin primarily converts JSX into component definitions. 

## Special features and considerations

### Define

The `define` function can be use in three ways:

```js
define(jsx)                 >> define({}, internalOpts)
define(proto, jsx)          >> define(proto, internalOpts)
define(proto, internalOpts) >> define(proto, internalOpts) 
```

This allows an override.



```js
var TestComponent = (0, _utils.define)({});
var TestComponent_prototype = TestComponent.prototype;
TestComponent_prototype.__ht = '<div id="test"><span>hello <text>-</text></span><span>-</span><span>hide me</span></div>';
TestComponent_prototype.__wc = [TestComponent_prototype.__wa('_1', 0, 0, 0, {
  'p.name': function pName(n, o, w, p, c) {
    w.text(n);
  }
}), TestComponent_prototype.__wa('_2', 0, 0, 0, {
  'service.name': function serviceName(n, o, w, p, c) {
    w.text(n);
  }
}), TestComponent_prototype.__wa('_3', 'show', 1, 0, {})];
TestComponent_prototype.__qc = TestComponent_prototype.__lu({
  'p.name': function pName(c, p) {
    return p.name;
  },
  'service.name': function serviceName(c, p) {
    return service.name;
  },
  'show': function show(c, p) {
    return _show;
  }
});
TestComponent_prototype.__ip = {};
TestComponent_prototype.__bv = function (component, prototype) {
  component.__bd(prototype);
  component.el = {
    '_1': component.__gw([0, 1]),
    '_2': component.__gw([1, 0]),
    '_3': component.__gw([2])
  };
};
TestComponent_prototype.__cn = undefined;

```

We would get:

```js
var TestComponent = (0, _utils.define)({}, [
 '<div id="test"><span>hello <text>-</text></span><span>-</span><span>hide me</span></div>',
 [
   ['_1', 0, 0, 0, {
     'p.name': function pName(n, o, w, p, c) {
       w.text(n);
     }
   }], 
   ['_2', 0, 0, 0, {
     'service.name': function serviceName(n, o, w, p, c) {
       w.text(n);
     }
   }],
   ['_3', 'show', 1, 0, {}]
], 
{
  'p.name': function pName(c, p) {
    return p.name;
  },
  'service.name': function serviceName(c, p) {
    return service.name;
  },
  'show': function show(c, p) {
    return _show;
  }
},
{},
function (component, prototype) {
  component.__bd(prototype);
  component.el = {
    '_1': component.__gw([0, 1]),
    '_2': component.__gw([1, 0]),
    '_3': component.__gw([2])
  };
},
undefined
]
```





```jsx
const Counter = define({},
  <div>
	Hello
  </div>
)
```





### Stubbs

#### Definition

The main handling of stubs is here:

```js
const handleStubs = (componentName, stubs, path) => {
  const statements = []
  for (const [stubName, stubHtml] of Object.entries(stubs)) {
    let anonymousCls = path.scope.generateUidIdentifier("sv").name
    statements.push(`var ${anonymousCls} = ${componentName}.prototype.__sv();`)
    statements.push(`${componentName}.prototype.__stubs__${stubName} = ${anonymousCls};`)
    generateStatements(anonymousCls, stubHtml, true, path).forEach(statement => {
      statements.push(statement)
    })
  }
  return statements
}
```

Essentially, for each stub we:

- Create an anonymous component e.g. `Xyz`
- Assign it to `componentName.prototype.__stubs__Xyz = Xyz`

In this case we collate all statements as one for all stubs, but that isn't necessary.

#### Usage

```js
function preprocessHTML(htmlString) {
  return htmlString.replace(/<use:/g, "<br :replace=")
    .replace(/<use=/g, "<br :replace=")
    .replace(/<stub:/g, "<br :stub=")
    .replace(/<stub=/g, "<br :stub=")
}
```

And

```js
':stub': {
  params: 'stubName',
  handle: function(stubName) {
    this.stubName = stubName
  }
}
```

Essentially we perform a little hack to make it use the `stub` directive, which in turn only sets `stubName`. This in turn is used by the code generator:

```js
saveStub(stubName, nodeTreeAddress) {
    if (!re_lnu.test(stubName)) {
      this.walker.throw('Stub name may only contain letters numbers and underscores')
    }
    this.nestedComponentProps.add(stubName, new FunctionStatement(propsCallbackArgs, ['return c.props']))
    const initCall = `${componentRefInBuild}.__ni(${getLookupArgs(nodeTreeAddress)}, this.__stubs__${stubName})`
    this.saveElement(stubName, initCall, [])
  }
```



##### Rethink

Maybe the stubs system is overly complicated, and rigid seeing as it requires inheritance. Maybe it can all be achieved by dynamically interpreting the component type and passing parent props as props (how about `_pass` == `_props="p"`)

```jsx
const MyComponent = define(
  <div>
    <div>
        <this.rowComponent _repeat={p.rows} />
    </div>
    <partials.footer _pass />
  </div>
)
```

The current implementation of stubs does nicely map c and p to its parent's, and we'd lose that. But maybe that's confusing. The new way also lets you substitute nested things as easily.



### Bubbles

Consider using a Proxy

### Nesting

(check nest, inner, child, use, repeat and)

replace is a synonym for nesting, 

We seem to treat nested classes declared in the html:

```js
/**
 * Nest Internal. For building a nested component declared in the html.
 */
proto.__ni = function(path, cls) {
  const child = buildComponent(cls, this)
  this.__gw(path).replace(child.e)
  return child
}
```

Differently from manual nesting:

```js
/**
 * Builds a nested component of the specified class. Its up to you how you use it.
 */
proto.nest = function(cls, props) {
  const child = createComponent(cls, this, props || this.props)
  this.__nv.push(child)
  return child
}
```

I want this to be dynamic, and happen after props are passed.

Current state:

```js
// called by `mount`, `nest` and `pool`
// Top level call for full component creation and initialisation
export function createComponent(cls, parent, props) {
  const component = buildComponent(cls, parent)
  component.props = props
  component.init()
  component.update()
  return component
}

// called by createComponent and `__ni`
export function buildComponent(cls, parent) {
  const component = new cls(parent)
  component.__bv(component, cls.prototype)
  return component
}

// Build DOM - not generated. Only called by __bv
proto.__bd = function(prototype) {
  if (prototype.__cn === undefined) {
    prototype.__cn = makeEl(prototype.__ht)
  }
  this.e = prototype.__cn.cloneNode(true)
}

// Nest Internal - not generated. Only called by __bv
proto.__ni = function(path, cls) {
  const child = buildComponent(cls, this)
  this.__gw(path).replace(child.e)
  return child
}

// Build view. Generated, and only called by `buildComponent`
proto.__bv = function(component, prototype) {
  component.__bd(prototype);
  component.el = {
    '_1': component.__ni([0], Child),
  };
};
```

Notes:

* `__bv` doesn't need to have component and prototype passed, it's just for speedup.

*  `__bv` doesn't do any more than the above, it seems to only be `beforeSave` and `afterSave` which are both unused.

* `__bd` could be called from `buildComponent`, or folder into that, in which case `__bv` could be renamed `__ic` for "initialise component" - although it only seems to set `el` so maybe that could be done by a prototype object:

  ```js
  .__el = {
    '_1': [ComponentDef, [0]] // path
  }
  ```

* I could give the methods proper names like `__nest_internal__` and shorten them in the bundle.

* `buildComponent` doesn't set props. I feel there was a reason for this relating to props state being ready?

* I could merge `__ip` into `__el` and change where `__ip` is used (only `init` and `update`). Note that value defaults to `0`.

New unified function:

```js
// called by `mount`, `nest` and `pool`
// Top level call for full component creation and initialisation
export function createComponent(cls, parent, props) {
  // parent is null when mounting
  const prototype = cls.prototype
  // build cloneable DOM element.
  if (prototype.__cn === undefined) {
    prototype.__cn = makeEl(prototype.__ht)
  }
  const component = new cls(
    parent,
  	prototype.__cn.cloneNode(true),
    props,
  )
  // Save elements
  for (k, v of prototype.__el) {
      // v = [cls, path]
      // note that we are not setting nested element props here - was that because we previously didn't have
      // props set here?
      const child = buildComponent(v[0], this)
      component.el[k] = child
      component.__gw(v[1]).replace(child.e)
  }
  component.init()
  component.update()
  return component
}
```

Comments on new format:

* I could pass `props` and `e` into constructor (remember call in `define` too )
* Figure out what to do with `init` - it only sets initial props on `nestedComponents` 
* What if I missed calls from generated code?
* **Check what happens with named wrappers.**

So how will this work when `cls` is something like `partials.footer` ? 

* I could call a function to return the class.
* I could generate the code.
* I could just place that string - but then it would be static

It would only be queried at point of building, and not re-queried when it updates. Having said that, I could make it work that way if specified, perhaps by a directive which attaches a watch which replaces the component.

How would partials work then?

```jsx
const Dialog = define(
  <div>
     Title:
     <this.form />
  </div>
)

const MyForm = define(<form></form>)

// THIS MUST WORK
const CustomDialog = define({
  _base: Dialog,
  form: MyForm,
})

// Maybe I need to generate 
define({
  _base: Dialog,
  form: MyForm,
}).__configure_protoype__(html, wc, wa...)
```

* **Check that above works and would still work with proposed changes**

Do we need `beforeInit` and `afterInit`? Could just override and do stuff before or after. In which case maybe best not fold it into create component. When would we actually need to do the stuff? After/before before setting props or child props?

What order do I do things in:

1. Fix always and never, so I can convert tests
2. Convert tests

Alternatives to `define` which is a js keyword:

```jsx
const ClickCounter = Component.def(
  <form></form>
)

const ClickCounter = Box.def(
  <form></form>
)

const ClickCounter = Block.def(
  <form></form>
)

const ClickCounter = Wallace.component(
  <form></form>
)
```

The problem with simpler syntax like direct assignment is that:

1. People need to switch code structure and imports when changing things
2. We need to ensure the import

I also want to ensure that we can extend without JSX, and that people can actually call the function with internal args. Provided I can solve the import issue, I can have direct JSX assignment, and leave more complex cases to use `Component.def`

### Parsing and Generating

* The index contains the visitor, which deals with top level entry into the AST.
* JSXElements are handled by context handlers, which deal transforming the code.
* The JSXParser returns the statements, it deals with walking the tree. It creates a CodeGenerator, and calls extractNodeData.



JSXParser walks the tree, and calls extractsNodeData, which extracts directives which , and tells the code generator whenever it finds a dynamic node.

It would maybe be simpler if the ` JSXParser` returned `ComponentDefinition` which has the html plus DynamicNodes collected.

And rename to `ComponentCodeGenerator`.

Maybe contexts should call `convertJSX` which takes JSX and returns code to insert. Maybe the parser should return a data structure



https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#-enabling-syntax-in-plugins



## Rethink



Using JSX is problematic as babel reads expressions as code and messes with the variables. Doing it as a html string is clunky as:

1. It doesn't recognise JS inside, so no intellisense
2. 