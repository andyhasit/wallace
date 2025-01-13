/*

Just keeping track of that the output looks like.

const Foo = (
  <div>
    <button onClick={foo}>push</button>
    <p>hello {name} </p>
  </div>
);
*/
import { findElement } from "wallace";
import { defineComponent } from "wallace";

export function defineComponent(
  inheritFrom,
  html,
  watches,
  queries,
  buildFunction,
  prototypeExtras,
) {
  const Constructor = extendComponent(
    inheritFrom || Component,
    prototypeExtras,
  );
  const proto = Constructor.prototype;

  proto.__wc = watches.map((arr) => ({
    wk: arr[0], // The key of the corresponding element.
    sq: arr[1], // The shield query key
    rv: arr[2], // whether shieldQuery should be flipped
    sc: arr[3], // The number of items to shield
    cb: arr[4], // The callbacks - object
  }));
  proto.__lu = new Lookup(queries);
  proto.__bv = buildFunction;
  proto.__cn = makeEl(html);

  return Constructor;
}

export const extendComponent = (base, prototypeExtras) => {
  const Constructor = function (parent) {
    base.call(this, parent);
  };
  Constructor.prototype = Object.create(base && base.prototype, {
    constructor: {
      value: Constructor,
      writable: true,
      configurable: true,
    },
  });
  Object.assign(Constructor.prototype, prototypeExtras);
  return Constructor;
};

const Foo = defineComponent(
  // inheritFrom
  0,
  // html
  "<div><button>push</button><p>hello <text>.</text></p></div>",
  // watches,
  [
    [
      "1", // stash key
      0,
      0,
      1,
      {
        foo: function (n, o, w, p, c) {
          w.onClick = n;
        },
      },
    ],
    [
      "2",
      0,
      0,
      0,
      {
        name: function (n, o, w, p, c) {
          w.textContent = n;
        },
      },
    ],
  ],
  // queries
  {
    foo: function (c, p) {
      return foo;
    },
    name: function (c, p) {
      return name;
    },
  },
  // buildFunction
  function (component, dom) {
    component.__stash = {
      1: findElement(dom, [0]),
      2: findElement(dom, [1, 1]),
    };
  },
  // prototype extras. should be an object.
  "{}",
);
